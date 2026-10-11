const assert = require("assert");

function computeReceiptTotals(order) {
  const items = order.items && order.items.length > 0 ? order.items : [];
  const itemsSubtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const grandTotal = Number(order.total) || 0;
  
  let shippingCharges = 0;
  let discount = 0;
  
  if (items.length > 0) {
    if (grandTotal > itemsSubtotal) {
      shippingCharges = grandTotal - itemsSubtotal;
    } else if (itemsSubtotal > grandTotal) {
      discount = itemsSubtotal - grandTotal;
    }
  }

  const normalizedStatus = (order.paymentStatus || "").toLowerCase().trim();
  const hasPaymentId = Boolean(order.paymentId && order.paymentId.trim() !== "");
  const isRefunded = normalizedStatus === "refunded";
  const isFailed = normalizedStatus === "failed";
  const isPaid = normalizedStatus === "paid" || (hasPaymentId && !["failed", "cod", "refunded", "pending"].includes(normalizedStatus));
  const isCOD = normalizedStatus === "cod";
  const isPending = normalizedStatus === "pending" || (!isPaid && !isCOD && !isRefunded && !isFailed);

  let paymentMode = "Online Gateway (Razorpay / UPI)";
  let paymentStatusLabel = "Paid";
  let onlineCollected = 0;
  let codToCollect = 0;
  let alreadyPaid = 0;
  let balanceDue = 0;

  const explicitOnlinePaid = typeof order.onlinePaid === "number" ? order.onlinePaid : typeof order.paidAmount === "number" ? order.paidAmount : null;
  const isPartial = explicitOnlinePaid !== null && explicitOnlinePaid > 0 && explicitOnlinePaid < grandTotal;

  if (isPartial) {
    paymentMode = "Partial Online + COD Balance";
    paymentStatusLabel = "Partially Paid";
    onlineCollected = explicitOnlinePaid;
    codToCollect = Math.max(0, grandTotal - explicitOnlinePaid);
    alreadyPaid = explicitOnlinePaid;
    balanceDue = codToCollect;
  } else if (isRefunded) {
    paymentMode = hasPaymentId ? "Online (Refunded)" : "Cash on Delivery (Refunded)";
    paymentStatusLabel = "Refunded";
    onlineCollected = 0;
    codToCollect = 0;
    alreadyPaid = 0;
    balanceDue = 0;
  } else if (isFailed) {
    paymentMode = "Online Gateway";
    paymentStatusLabel = "Payment Failed";
    onlineCollected = 0;
    codToCollect = 0;
    alreadyPaid = 0;
    balanceDue = grandTotal;
  } else if (isPaid) {
    paymentMode = "Online Gateway (Razorpay / UPI)";
    paymentStatusLabel = "Paid";
    onlineCollected = grandTotal;
    codToCollect = 0;
    alreadyPaid = grandTotal;
    balanceDue = 0;
  } else if (isCOD) {
    paymentMode = "Cash on Delivery (COD)";
    paymentStatusLabel = "Pending on Delivery";
    onlineCollected = 0;
    codToCollect = grandTotal;
    alreadyPaid = 0;
    balanceDue = grandTotal;
  } else if (isPending) {
    paymentMode = hasPaymentId ? "Online Gateway (Pending)" : "Pending";
    paymentStatusLabel = "Pending";
    onlineCollected = 0;
    codToCollect = 0;
    alreadyPaid = 0;
    balanceDue = grandTotal;
  }

  return {
    itemsSubtotal,
    shippingCharges,
    discount,
    grandTotal,
    paymentMode,
    paymentStatusLabel,
    onlineCollected,
    codToCollect,
    alreadyPaid,
    balanceDue
  };
}

console.log("--- Starting Order Receipt Calculation Tests ---");

// Test 1: Fully paid online order
{
  const res = computeReceiptTotals({
    total: 958,
    paymentStatus: "paid",
    paymentId: "pay_Q8h19xKls02",
    items: [
      { name: "Wood Pressed Groundnut Oil", size: "1 L", price: 479, quantity: 2 }
    ]
  });
  assert.strictEqual(res.onlineCollected, 958);
  assert.strictEqual(res.codToCollect, 0);
  assert.strictEqual(res.alreadyPaid, 958);
  assert.strictEqual(res.balanceDue, 0);
  assert.strictEqual(res.paymentStatusLabel, "Paid");
  console.log("✔ Test 1 Passed: Fully paid online order");
}

// Test 2: COD order with no online payment
{
  const res = computeReceiptTotals({
    total: 499,
    paymentStatus: "cod",
    paymentId: null,
    items: [
      { name: "Wood Pressed Sesame Oil", size: "1 L", price: 499, quantity: 1 }
    ]
  });
  assert.strictEqual(res.onlineCollected, 0);
  assert.strictEqual(res.codToCollect, 499);
  assert.strictEqual(res.alreadyPaid, 0);
  assert.strictEqual(res.balanceDue, 499);
  assert.strictEqual(res.paymentStatusLabel, "Pending on Delivery");
  console.log("✔ Test 2 Passed: COD order without online payment");
}

// Test 3: Partially paid order
{
  const res = computeReceiptTotals({
    total: 1000,
    paymentStatus: "partially_paid",
    onlinePaid: 300,
    items: [
      { name: "Jai Sriram Semi-Polished Rice", size: "5 kg", price: 500, quantity: 2 }
    ]
  });
  assert.strictEqual(res.onlineCollected, 300);
  assert.strictEqual(res.codToCollect, 700);
  assert.strictEqual(res.alreadyPaid, 300);
  assert.strictEqual(res.balanceDue, 700);
  assert.strictEqual(res.paymentStatusLabel, "Partially Paid");
  console.log("✔ Test 3 Passed: Partially paid order");
}

// Test 4: Pending and failed payments
{
  const resPending = computeReceiptTotals({
    total: 88,
    paymentStatus: "pending",
    paymentId: null,
    items: [
      { name: "Jai Sriram Semi-Polished Rice", size: "1 kg", price: 88, quantity: 1 }
    ]
  });
  assert.strictEqual(resPending.onlineCollected, 0);
  assert.strictEqual(resPending.codToCollect, 0);
  assert.strictEqual(resPending.alreadyPaid, 0);
  assert.strictEqual(resPending.balanceDue, 88);
  assert.strictEqual(resPending.paymentStatusLabel, "Pending");
  console.log("✔ Test 4a Passed: Pending payment");

  const resFailed = computeReceiptTotals({
    total: 479,
    paymentStatus: "failed",
    paymentId: "pay_failed_xyz",
    items: [
      { name: "Wood Pressed Groundnut Oil", size: "1 L", price: 479, quantity: 1 }
    ]
  });
  assert.strictEqual(resFailed.onlineCollected, 0);
  assert.strictEqual(resFailed.codToCollect, 0);
  assert.strictEqual(resFailed.alreadyPaid, 0);
  assert.strictEqual(resFailed.balanceDue, 479);
  assert.strictEqual(resFailed.paymentStatusLabel, "Payment Failed");
  console.log("✔ Test 4b Passed: Failed payment");
}

// Test 5: Refunded order
{
  const res = computeReceiptTotals({
    total: 750,
    paymentStatus: "refunded",
    paymentId: "pay_refund_123",
    items: [
      { name: "Harvest Fresh Raw Groundnuts", size: "2 kg", price: 750, quantity: 1 }
    ]
  });
  assert.strictEqual(res.onlineCollected, 0);
  assert.strictEqual(res.codToCollect, 0);
  assert.strictEqual(res.alreadyPaid, 0);
  assert.strictEqual(res.balanceDue, 0);
  assert.strictEqual(res.paymentStatusLabel, "Refunded");
  console.log("✔ Test 5 Passed: Refunded order");
}

// Test 6: Multiple products with shipping fee
{
  const res = computeReceiptTotals({
    total: 1148, // 479 + 499 + 70 + 100 shipping
    paymentStatus: "paid",
    paymentId: "pay_multi_123",
    items: [
      { name: "Wood Pressed Groundnut Oil", size: "1 L", price: 479, quantity: 1 },
      { name: "Wood Pressed Sesame Oil", size: "1 L", price: 499, quantity: 1 },
      { name: "Jai Sriram Semi-Polished Rice", size: "1 kg", price: 70, quantity: 1 }
    ]
  });
  assert.strictEqual(res.itemsSubtotal, 1048);
  assert.strictEqual(res.shippingCharges, 100);
  assert.strictEqual(res.grandTotal, 1148);
  assert.strictEqual(res.onlineCollected, 1148);
  assert.strictEqual(res.codToCollect, 0);
  assert.strictEqual(res.balanceDue, 0);
  console.log("✔ Test 6 Passed: Multiple products with shipping");
}

console.log("\nALL 6 TEST CASES PASSED PERFECTLY!");
