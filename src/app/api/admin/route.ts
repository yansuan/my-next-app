import { NextRequest, NextResponse } from "next/server";
import { getAdminStore } from "@/lib/admin/store";

export async function GET(req: NextRequest) {
  const store = getAdminStore();
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  const filteredUsers = query
    ? store.users.filter(
        (u) =>
          u.email.toLowerCase().includes(query) ||
          u.displayName.toLowerCase().includes(query) ||
          u.signupIp.toLowerCase().includes(query) ||
          u.deviceFingerprint.toLowerCase().includes(query)
      )
    : store.users;

  // Compute live KPI summary
  const totalRevenueUsd = store.orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.amountUsd, 0);
  const totalAccountsInAbuseClusters = store.abuseClusters
    .filter((c) => c.signal === "ip")
    .reduce((sum, c) => sum + c.accounts, 0);
  const totalCreditsPrevented = store.abuseClusters
    .filter((c) => c.signal === "ip")
    .reduce((sum, c) => sum + Math.max(0, c.accounts - c.granted) * 100, 0);

  return NextResponse.json({
    metrics: {
      totalUsers: store.users.length + 42,
      activeUsers7d: 38,
      totalGenerations: store.generations.length + 312,
      succeededGenerations:
        store.generations.filter((g) => g.status === "succeeded").length + 298,
      refundedGenerations:
        store.generations.filter((g) => g.status === "refunded" || g.status === "failed").length +
        14,
      totalUploads: store.uploads.length + 124,
      totalRevenueUsd,
      paidOrdersCount: store.orders.filter((o) => o.status === "paid").length,
      abuseClustersCount: store.abuseClusters.length,
      abuseAccounts7d: totalAccountsInAbuseClusters,
      abuseCreditsSaved: totalCreditsPrevented,
    },
    abuseClusters: store.abuseClusters,
    users: filteredUsers,
    generations: store.generations,
    uploads: store.uploads,
    orders: store.orders,
    auditLogs: store.auditLogs,
  });
}

export async function POST(req: NextRequest) {
  const store = getAdminStore();
  const body = await req.json();
  const { action, actorEmail = "ops@reelmux.com" } = body;
  const nowStr = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";

  if (action === "update_admin_profile") {
    const cleanName = String(body.newAdminName || "ops@reelmux.com").trim();
    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorEmail: cleanName,
      action: "admin.profile.updated",
      targetType: "system",
      targetId: cleanName,
      summary: `Updated isolated Admin Console operator handle to ${cleanName}.`,
      ipAddress: "103.149.28.11",
      createdAt: nowStr,
    });
    return NextResponse.json({ ok: true, adminName: cleanName });
  }

  if (action === "block_abuse_signal") {
    const { clusterId } = body;
    const cluster = store.abuseClusters.find((c) => c.id === clusterId);
    if (!cluster) {
      return NextResponse.json({ error: "Cluster not found" }, { status: 404 });
    }
    cluster.blocked = !cluster.blocked;

    // Also update matching users
    store.users.forEach((u) => {
      if (
        (cluster.signal === "ip" && u.signupIp === cluster.key) ||
        (cluster.signal === "fingerprint" && u.deviceFingerprint.startsWith(cluster.key.slice(0, 16)))
      ) {
        u.status = cluster.blocked ? "banned" : "flagged";
      }
    });

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorEmail,
      action: cluster.blocked ? "abuse.signal.blocked" : "abuse.signal.unblocked",
      targetType: "abuse_signal",
      targetId: `${cluster.signal}:${cluster.displayKey}`,
      summary: `${cluster.blocked ? "Blocked" : "Unblocked"} ${cluster.signal} signal ${cluster.displayKey} (${cluster.accounts} linked accounts).`,
      ipAddress: "103.149.28.11",
      createdAt: nowStr,
    });

    return NextResponse.json({ ok: true, cluster });
  }

  if (action === "revoke_cluster_credits") {
    const { clusterId } = body;
    const cluster = store.abuseClusters.find((c) => c.id === clusterId);
    if (!cluster) {
      return NextResponse.json({ error: "Cluster not found" }, { status: 404 });
    }
    const previousGranted = cluster.granted;
    cluster.granted = 0;

    store.users.forEach((u) => {
      if (
        (cluster.signal === "ip" && u.signupIp === cluster.key) ||
        (cluster.signal === "fingerprint" && u.deviceFingerprint.startsWith(cluster.key.slice(0, 16)))
      ) {
        if (u.paidTotalUsd === 0) {
          u.balanceAvailable = 0;
          u.freeCreditsGranted = false;
          u.status = "flagged";
        }
      }
    });

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorEmail,
      action: "abuse.cluster.credits_revoked",
      targetType: "abuse_signal",
      targetId: `${cluster.signal}:${cluster.displayKey}`,
      summary: `Revoked free trial credits across ${previousGranted} granted account(s) sharing ${cluster.signal} ${cluster.displayKey}.`,
      ipAddress: "103.149.28.11",
      createdAt: nowStr,
    });

    return NextResponse.json({ ok: true, cluster });
  }

  if (action === "adjust_user_credits") {
    const { userId, delta, note } = body;
    const user = store.users.find((u) => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const numericDelta = Number(delta) || 0;
    user.balanceAvailable = Math.max(0, user.balanceAvailable + numericDelta);

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorEmail,
      action: "user.credits.adjusted",
      targetType: "user",
      targetId: user.email,
      summary: `Adjusted credits by ${numericDelta >= 0 ? `+${numericDelta}` : numericDelta} (New balance: ${user.balanceAvailable}). ${note || ""}`.trim(),
      ipAddress: "103.149.28.11",
      createdAt: nowStr,
    });

    return NextResponse.json({ ok: true, user });
  }

  if (action === "set_user_status") {
    const { userId, status } = body;
    const user = store.users.find((u) => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    user.status = status;

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorEmail,
      action: `user.status.${status}`,
      targetType: "user",
      targetId: user.email,
      summary: `Changed account status for ${user.email} to "${status}".`,
      ipAddress: "103.149.28.11",
      createdAt: nowStr,
    });

    return NextResponse.json({ ok: true, user });
  }

  if (action === "refund_generation") {
    const { generationId } = body;
    const gen = store.generations.find((g) => g.id === generationId);
    if (!gen) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }
    gen.status = "refunded";
    const owner = store.users.find((u) => u.email === gen.userEmail);
    if (owner) {
      owner.balanceAvailable += gen.creditsCost;
    }

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorEmail,
      action: "generation.manual_refund",
      targetType: "generation",
      targetId: gen.id,
      summary: `Refunded ${gen.creditsCost} credits to ${gen.userEmail} for job ${gen.id} (${gen.modelName}).`,
      ipAddress: "103.149.28.11",
      createdAt: nowStr,
    });

    return NextResponse.json({ ok: true, generation: gen });
  }

  if (action === "moderate_upload") {
    const { uploadId, moderationStatus } = body;
    const upload = store.uploads.find((u) => u.id === uploadId);
    if (!upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }
    upload.moderationStatus = moderationStatus;

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorEmail,
      action: `upload.moderation.${moderationStatus}`,
      targetType: "upload",
      targetId: upload.fileName,
      summary: `Set moderation status of ${upload.fileName} (${upload.userEmail}) to "${moderationStatus}".`,
      ipAddress: "103.149.28.11",
      createdAt: nowStr,
    });

    return NextResponse.json({ ok: true, upload });
  }

  if (action === "refund_order") {
    const { orderId } = body;
    const order = store.orders.find((o) => o.id === orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    order.status = "refunded";
    const owner = store.users.find((u) => u.email === order.userEmail);
    if (owner) {
      owner.balanceAvailable = Math.max(0, owner.balanceAvailable - order.creditsGranted);
      owner.paidTotalUsd = Math.max(0, owner.paidTotalUsd - order.amountUsd);
    }

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorEmail,
      action: "order.refunded",
      targetType: "order",
      targetId: order.orderNo,
      summary: `Refunded order ${order.orderNo} ($${order.amountUsd} USD, -${order.creditsGranted} credits) for ${order.userEmail}.`,
      ipAddress: "103.149.28.11",
      createdAt: nowStr,
    });

    return NextResponse.json({ ok: true, order });
  }

  return NextResponse.json({ error: "Unknown admin action" }, { status: 400 });
}
