/**
 * Order Details and Tracking API
 * GET /api/orders/[orderId] - Get specific order details
 * PATCH /api/orders/[orderId] - Update order tracking stage
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderTrackingStage } from '@/lib/firestore';
import { TrackingStage } from '@/types/order';

interface RouteParams {
  params: {
    orderId: string;
  };
}

/**
 * GET /api/orders/[orderId]
 * Get specific order details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User authentication required',
          error: 'Missing user ID in headers',
        },
        { status: 401 }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order ID is required',
          error: 'Missing orderId parameter',
        },
        { status: 400 }
      );
    }

    const order = await getOrderById(userId, orderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order not found',
          error: `Order ${orderId} not found for user ${userId}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order retrieved successfully',
        data: order,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching order',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[orderId]
 * Update order tracking stage
 * 
 * Request body:
 * {
 *   "trackingStage": "out_for_lab" | "kit_reached_lab" | "testing_in_progress" | "processing_result" | "result_ready",
 *   "notes": "optional notes"
 * }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User authentication required',
          error: 'Missing user ID in headers',
        },
        { status: 401 }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order ID is required',
          error: 'Missing orderId parameter',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { trackingStage, notes } = body;

    if (!trackingStage) {
      return NextResponse.json(
        {
          success: false,
          message: 'Tracking stage is required',
          error: 'Missing trackingStage field',
        },
        { status: 400 }
      );
    }

    // Validate tracking stage value
    const validStages: TrackingStage[] = [
      'pending',
      'out_for_lab',
      'kit_reached_lab',
      'testing_in_progress',
      'processing_result',
      'result_ready',
      'cancelled',
    ];

    if (!validStages.includes(trackingStage)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid tracking stage',
          error: `trackingStage must be one of: ${validStages.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Update tracking stage in Firestore
    const success = await updateOrderTrackingStage(
      userId,
      orderId,
      trackingStage as TrackingStage,
      notes
    );

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update order tracking stage',
          error: 'Could not update order in database',
        },
        { status: 500 }
      );
    }

    // Fetch updated order
    const updatedOrder = await getOrderById(userId, orderId);

    return NextResponse.json(
      {
        success: true,
        message: 'Order tracking stage updated successfully',
        data: updatedOrder,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating order tracking stage:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error updating order tracking stage',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
