import { NextResponse } from "next/server";
import { Cashfree } from "cashfree-pg";

// Initialize Cashfree
Cashfree.XClientId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID!;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, customerDetails } = body;

    const orderId = `order_${Date.now()}_${customerDetails.customerId.slice(
      0,
      8
    )}`;

    const orderRequest = {
      order_amount: amount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: customerDetails.customerId,
        customer_email: customerDetails.customerEmail,
        customer_phone: customerDetails.customerPhone,
        customer_name: customerDetails.customerName,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/status?order_id={order_id}`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      },
    };

    // console.log(orderReqconsole.log("Received request body:", body);
console.log("Generated order ID:", orderId);
console.log("Order request:", orderRequest);uest);
    // Create order using Cashfree SDK
    const response = await Cashfree.PGCreateOrder("2022-09-01", orderRequest);
    console.log(response.data);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Cashfree error:", error?.response?.data?.message || error);
    return NextResponse.json(
      { error: error?.response?.data?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
