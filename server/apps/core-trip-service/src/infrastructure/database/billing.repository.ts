import type { QueryExecutor } from '@roadtrip/db-client';

export interface OrderRecord {
  id: string;
  userId: string;
  tripId: string | null;
  itemType: 'TRAVEL_BOOK' | 'PARTNER_SERVICE' | 'SUBSCRIPTION' | 'OTHER';
  itemId: string;
  title: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  paymentMethod: string | null;
  paymentRef: string | null;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface TravelBookRecord {
  id: string;
  tripId: string;
  userId: string;
  title: string;
  subtitle: string | null;
  format: 'DIGITAL_PDF' | 'SOFTCOVER' | 'HARDCOVER';
  pageCount: number;
  coverPhotoUrl: string | null;
  shippingAddress: {
    recipientName?: string;
    phone?: string;
    address?: string;
    city?: string;
  } | null;
  status: 'DRAFT' | 'ORDERED' | 'PRINTING' | 'SHIPPED' | 'DELIVERED';
  orderId: string | null;
  previewData: Record<string, any>;
  createdAt: string;
}

export class BillingRepository {
  constructor(private readonly database: QueryExecutor) {}

  async createOrder(data: {
    userId: string;
    tripId?: string | null;
    itemType: string;
    itemId: string;
    title: string;
    amount: number;
    currency?: string;
    metadata?: Record<string, any>;
  }): Promise<OrderRecord> {
    const res = await this.database.query<{
      id: string;
      user_id: string;
      trip_id: string | null;
      item_type: string;
      item_id: string;
      title: string;
      amount: string;
      currency: string;
      status: string;
      payment_method: string | null;
      payment_ref: string | null;
      metadata: Record<string, any>;
      created_at: string;
    }>(
      `INSERT INTO billing_schema.orders
        (user_id, trip_id, item_type, item_id, title, amount, currency, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, user_id, trip_id, item_type, item_id, title, amount, currency,
                 status, payment_method, payment_ref, metadata, created_at`,
      [
        data.userId,
        data.tripId || null,
        data.itemType,
        data.itemId,
        data.title,
        data.amount,
        data.currency || 'VND',
        JSON.stringify(data.metadata || {}),
      ],
    );
    const r = res.rows[0]!;
    return {
      id: r.id,
      userId: r.user_id,
      tripId: r.trip_id,
      itemType: r.item_type as OrderRecord['itemType'],
      itemId: r.item_id,
      title: r.title,
      amount: parseFloat(r.amount),
      currency: r.currency,
      status: r.status as OrderRecord['status'],
      paymentMethod: r.payment_method,
      paymentRef: r.payment_ref,
      metadata: r.metadata || {},
      createdAt: r.created_at,
    };
  }

  async getOrder(orderId: string, userId?: string): Promise<OrderRecord | null> {
    const query = userId
      ? `SELECT id, user_id, trip_id, item_type, item_id, title, amount, currency,
                status, payment_method, payment_ref, metadata, created_at
         FROM billing_schema.orders
         WHERE id = $1 AND user_id = $2`
      : `SELECT id, user_id, trip_id, item_type, item_id, title, amount, currency,
                status, payment_method, payment_ref, metadata, created_at
         FROM billing_schema.orders
         WHERE id = $1`;
    const params = userId ? [orderId, userId] : [orderId];
    const res = await this.database.query<{
      id: string;
      user_id: string;
      trip_id: string | null;
      item_type: string;
      item_id: string;
      title: string;
      amount: string;
      currency: string;
      status: string;
      payment_method: string | null;
      payment_ref: string | null;
      metadata: Record<string, any>;
      created_at: string;
    }>(query, params);

    const r = res.rows[0];
    if (!r) return null;
    return {
      id: r.id,
      userId: r.user_id,
      tripId: r.trip_id,
      itemType: r.item_type as OrderRecord['itemType'],
      itemId: r.item_id,
      title: r.title,
      amount: parseFloat(r.amount),
      currency: r.currency,
      status: r.status as OrderRecord['status'],
      paymentMethod: r.payment_method,
      paymentRef: r.payment_ref,
      metadata: r.metadata || {},
      createdAt: r.created_at,
    };
  }

  async listOrders(userId: string): Promise<OrderRecord[]> {
    const res = await this.database.query<{
      id: string;
      user_id: string;
      trip_id: string | null;
      item_type: string;
      item_id: string;
      title: string;
      amount: string;
      currency: string;
      status: string;
      payment_method: string | null;
      payment_ref: string | null;
      metadata: Record<string, any>;
      created_at: string;
    }>(
      `SELECT id, user_id, trip_id, item_type, item_id, title, amount, currency,
              status, payment_method, payment_ref, metadata, created_at
       FROM billing_schema.orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );
    return res.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      tripId: r.trip_id,
      itemType: r.item_type as OrderRecord['itemType'],
      itemId: r.item_id,
      title: r.title,
      amount: parseFloat(r.amount),
      currency: r.currency,
      status: r.status as OrderRecord['status'],
      paymentMethod: r.payment_method,
      paymentRef: r.payment_ref,
      metadata: r.metadata || {},
      createdAt: r.created_at,
    }));
  }

  async processWebhook(data: {
    transactionId: string;
    orderId: string;
    amount: number;
    status: 'SUCCESS' | 'FAILED';
    signature: string;
    paymentMethod?: string;
    payload?: Record<string, any>;
  }) {
    // 1. Replay defense check
    const existing = await this.database.query<{ id: string }>(
      `SELECT id FROM billing_schema.payments WHERE transaction_id = $1`,
      [data.transactionId],
    );
    if (existing.rows[0]) {
      return { processed: true, duplicate: true, orderId: data.orderId };
    }

    // 2. Insert payment record
    await this.database.query(
      `INSERT INTO billing_schema.payments
        (order_id, transaction_id, amount, status, signature, payload)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        data.orderId,
        data.transactionId,
        data.amount,
        data.status,
        data.signature,
        JSON.stringify(data.payload || {}),
      ],
    );

    // 3. Update order status idempotently
    const targetOrderStatus = data.status === 'SUCCESS' ? 'COMPLETED' : 'FAILED';
    const orderRes = await this.database.query<{ item_type: string; item_id: string }>(
      `UPDATE billing_schema.orders
       SET status = $2,
           payment_method = COALESCE($3, payment_method),
           payment_ref = $4,
           updated_at = now()
       WHERE id = $1
       RETURNING item_type, item_id`,
      [data.orderId, targetOrderStatus, data.paymentMethod || 'VIETQR', data.transactionId],
    );

    const order = orderRes.rows[0];
    if (order && data.status === 'SUCCESS' && order.item_type === 'TRAVEL_BOOK') {
      // Transition travel book to ORDERED
      await this.database.query(
        `UPDATE billing_schema.travel_books
         SET status = 'ORDERED', order_id = $2, updated_at = now()
         WHERE id = $1`,
        [order.item_id, data.orderId],
      );
    }

    return {
      processed: true,
      duplicate: false,
      orderId: data.orderId,
      status: targetOrderStatus,
    };
  }

  async getOrCreateTravelBook(tripId: string, userId: string): Promise<TravelBookRecord> {
    const existing = await this.database.query<{
      id: string;
      trip_id: string;
      user_id: string;
      title: string;
      subtitle: string | null;
      format: string;
      page_count: number;
      cover_photo_url: string | null;
      shipping_address: any;
      status: string;
      order_id: string | null;
      preview_data: any;
      created_at: string;
    }>(
      `SELECT id, trip_id, user_id, title, subtitle, format, page_count,
              cover_photo_url, shipping_address, status, order_id, preview_data, created_at
       FROM billing_schema.travel_books
       WHERE trip_id = $1`,
      [tripId],
    );

    if (existing.rows[0]) {
      const r = existing.rows[0];
      return {
        id: r.id,
        tripId: r.trip_id,
        userId: r.user_id,
        title: r.title,
        subtitle: r.subtitle,
        format: r.format as TravelBookRecord['format'],
        pageCount: r.page_count,
        coverPhotoUrl: r.cover_photo_url,
        shippingAddress: r.shipping_address,
        status: r.status as TravelBookRecord['status'],
        orderId: r.order_id,
        previewData: r.preview_data || {},
        createdAt: r.created_at,
      };
    }

    // Retrieve trip details for default cover
    const tripRes = await this.database.query<{ title: string }>(
      `SELECT title FROM trip_schema.trips WHERE id = $1`,
      [tripId],
    );
    const tripTitle = tripRes.rows[0]?.title || 'Nhật Ký Hành Trình';

    // Retrieve cover photo from memory or photo table
    const memRes = await this.database.query<{ cover_photo_url: string | null }>(
      `SELECT cover_photo_url FROM trip_schema.trip_memories WHERE trip_id = $1`,
      [tripId],
    );
    const coverUrl = memRes.rows[0]?.cover_photo_url || null;

    const insertRes = await this.database.query<{
      id: string;
      trip_id: string;
      user_id: string;
      title: string;
      subtitle: string | null;
      format: string;
      page_count: number;
      cover_photo_url: string | null;
      shipping_address: any;
      status: string;
      order_id: string | null;
      preview_data: any;
      created_at: string;
    }>(
      `INSERT INTO billing_schema.travel_books
        (trip_id, user_id, title, subtitle, format, page_count, cover_photo_url, preview_data)
       VALUES ($1, $2, $3, $4, 'HARDCOVER', 24, $5, $6)
       RETURNING id, trip_id, user_id, title, subtitle, format, page_count,
                 cover_photo_url, shipping_address, status, order_id, preview_data, created_at`,
      [
        tripId,
        userId,
        tripTitle,
        'Tuyển tập khoảnh khắc và cung đường',
        coverUrl,
        JSON.stringify({ generatedFrom: 'TRIP_MEMORY', photosIncluded: 16 }),
      ],
    );
    const r = insertRes.rows[0]!;
    return {
      id: r.id,
      tripId: r.trip_id,
      userId: r.user_id,
      title: r.title,
      subtitle: r.subtitle,
      format: r.format as TravelBookRecord['format'],
      pageCount: r.page_count,
      coverPhotoUrl: r.cover_photo_url,
      shippingAddress: r.shipping_address,
      status: r.status as TravelBookRecord['status'],
      orderId: r.order_id,
      previewData: r.preview_data || {},
      createdAt: r.created_at,
    };
  }

  async getTravelBook(bookId: string): Promise<TravelBookRecord | null> {
    const res = await this.database.query<{
      id: string;
      trip_id: string;
      user_id: string;
      title: string;
      subtitle: string | null;
      format: string;
      page_count: number;
      cover_photo_url: string | null;
      shipping_address: any;
      status: string;
      order_id: string | null;
      preview_data: any;
      created_at: string;
    }>(
      `SELECT id, trip_id, user_id, title, subtitle, format, page_count,
              cover_photo_url, shipping_address, status, order_id, preview_data, created_at
       FROM billing_schema.travel_books
       WHERE id = $1`,
      [bookId],
    );
    const r = res.rows[0];
    if (!r) return null;
    return {
      id: r.id,
      tripId: r.trip_id,
      userId: r.user_id,
      title: r.title,
      subtitle: r.subtitle,
      format: r.format as TravelBookRecord['format'],
      pageCount: r.page_count,
      coverPhotoUrl: r.cover_photo_url,
      shippingAddress: r.shipping_address,
      status: r.status as TravelBookRecord['status'],
      orderId: r.order_id,
      previewData: r.preview_data || {},
      createdAt: r.created_at,
    };
  }

  async updateTravelBook(
    bookId: string,
    data: Partial<{
      title: string;
      subtitle: string | null;
      format: 'DIGITAL_PDF' | 'SOFTCOVER' | 'HARDCOVER';
      coverPhotoUrl: string | null;
      shippingAddress: any;
    }>,
  ) {
    const fields: string[] = [];
    const values: any[] = [bookId];
    let idx = 2;

    if (data.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(data.title);
    }
    if (data.subtitle !== undefined) {
      fields.push(`subtitle = $${idx++}`);
      values.push(data.subtitle);
    }
    if (data.format !== undefined) {
      fields.push(`format = $${idx++}`);
      values.push(data.format);
    }
    if (data.coverPhotoUrl !== undefined) {
      fields.push(`cover_photo_url = $${idx++}`);
      values.push(data.coverPhotoUrl);
    }
    if (data.shippingAddress !== undefined) {
      fields.push(`shipping_address = $${idx++}`);
      values.push(JSON.stringify(data.shippingAddress));
    }

    if (fields.length === 0) return { id: bookId };

    fields.push('updated_at = now()');

    await this.database.query(
      `UPDATE billing_schema.travel_books
       SET ${fields.join(', ')}
       WHERE id = $1`,
      values,
    );
    return { id: bookId };
  }
}
