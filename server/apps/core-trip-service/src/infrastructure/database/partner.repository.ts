import type { QueryExecutor } from '@roadtrip/db-client';

export interface PartnerApplicationRecord {
  id: string;
  userId: string;
  applicantName?: string | null;
  businessName: string;
  businessType: string;
  contactEmail: string;
  contactPhone: string;
  taxId: string | null;
  description: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  reviewNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface PartnerListingRecord {
  id: string;
  partnerId: string;
  title: string;
  description: string;
  category: 'STAY' | 'FOOD' | 'EXPERIENCE' | 'TRANSPORT' | 'EQUIPMENT';
  locationName: string;
  priceAmount: number;
  priceCurrency: string;
  mediaUrls: string[];
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  createdAt: string;
}

export class PartnerRepository {
  constructor(private readonly database: QueryExecutor) {}

  async getApplication(userId: string): Promise<PartnerApplicationRecord | null> {
    const res = await this.database.query<{
      id: string;
      user_id: string;
      business_name: string;
      business_type: string;
      contact_email: string;
      contact_phone: string;
      tax_id: string | null;
      description: string | null;
      status: string;
      review_notes: string | null;
      reviewed_by: string | null;
      reviewed_at: string | null;
      created_at: string;
    }>(
      `SELECT id, user_id, business_name, business_type, contact_email, contact_phone,
              tax_id, description, status, review_notes, reviewed_by, reviewed_at, created_at
       FROM partner_schema.applications
       WHERE user_id = $1`,
      [userId],
    );
    const r = res.rows[0];
    if (!r) return null;
    return {
      id: r.id,
      userId: r.user_id,
      businessName: r.business_name,
      businessType: r.business_type,
      contactEmail: r.contact_email,
      contactPhone: r.contact_phone,
      taxId: r.tax_id,
      description: r.description,
      status: r.status as PartnerApplicationRecord['status'],
      reviewNotes: r.review_notes,
      reviewedBy: r.reviewed_by,
      reviewedAt: r.reviewed_at,
      createdAt: r.created_at,
    };
  }

  async submitApplication(data: {
    userId: string;
    businessName: string;
    businessType: string;
    contactEmail: string;
    contactPhone: string;
    taxId?: string | null;
    description?: string | null;
  }): Promise<PartnerApplicationRecord> {
    const res = await this.database.query<{
      id: string;
      user_id: string;
      business_name: string;
      business_type: string;
      contact_email: string;
      contact_phone: string;
      tax_id: string | null;
      description: string | null;
      status: string;
      review_notes: string | null;
      reviewed_by: string | null;
      reviewed_at: string | null;
      created_at: string;
    }>(
      `INSERT INTO partner_schema.applications
        (user_id, business_name, business_type, contact_email, contact_phone, tax_id, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
       ON CONFLICT (user_id) DO UPDATE
       SET business_name = EXCLUDED.business_name,
           business_type = EXCLUDED.business_type,
           contact_email = EXCLUDED.contact_email,
           contact_phone = EXCLUDED.contact_phone,
           tax_id = EXCLUDED.tax_id,
           description = EXCLUDED.description,
           status = 'PENDING',
           review_notes = NULL,
           reviewed_by = NULL,
           reviewed_at = NULL,
           updated_at = now()
       RETURNING id, user_id, business_name, business_type, contact_email, contact_phone,
                 tax_id, description, status, review_notes, reviewed_by, reviewed_at, created_at`,
      [
        data.userId,
        data.businessName,
        data.businessType,
        data.contactEmail,
        data.contactPhone,
        data.taxId || null,
        data.description || null,
      ],
    );
    const r = res.rows[0]!;
    return {
      id: r.id,
      userId: r.user_id,
      businessName: r.business_name,
      businessType: r.business_type,
      contactEmail: r.contact_email,
      contactPhone: r.contact_phone,
      taxId: r.tax_id,
      description: r.description,
      status: r.status as PartnerApplicationRecord['status'],
      reviewNotes: r.review_notes,
      reviewedBy: r.reviewed_by,
      reviewedAt: r.reviewed_at,
      createdAt: r.created_at,
    };
  }

  async listApplications(status?: string): Promise<PartnerApplicationRecord[]> {
    const query = status
      ? `SELECT a.id, a.user_id, a.business_name, a.business_type, a.contact_email, a.contact_phone,
                a.tax_id, a.description, a.status, a.review_notes, a.reviewed_by, a.reviewed_at, a.created_at,
                p.full_name AS applicant_name
         FROM partner_schema.applications a
         LEFT JOIN users_schema.profiles p ON p.id = a.user_id
         WHERE a.status = $1
         ORDER BY a.created_at DESC`
      : `SELECT a.id, a.user_id, a.business_name, a.business_type, a.contact_email, a.contact_phone,
                a.tax_id, a.description, a.status, a.review_notes, a.reviewed_by, a.reviewed_at, a.created_at,
                p.full_name AS applicant_name
         FROM partner_schema.applications a
         LEFT JOIN users_schema.profiles p ON p.id = a.user_id
         ORDER BY a.created_at DESC`;
    const params = status ? [status] : [];
    const res = await this.database.query<{
      id: string;
      user_id: string;
      applicant_name: string | null;
      business_name: string;
      business_type: string;
      contact_email: string;
      contact_phone: string;
      tax_id: string | null;
      description: string | null;
      status: string;
      review_notes: string | null;
      reviewed_by: string | null;
      reviewed_at: string | null;
      created_at: string;
    }>(query, params);

    return res.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      applicantName: r.applicant_name,
      businessName: r.business_name,
      businessType: r.business_type,
      contactEmail: r.contact_email,
      contactPhone: r.contact_phone,
      taxId: r.tax_id,
      description: r.description,
      status: r.status as PartnerApplicationRecord['status'],
      reviewNotes: r.review_notes,
      reviewedBy: r.reviewed_by,
      reviewedAt: r.reviewed_at,
      createdAt: r.created_at,
    }));
  }

  async reviewApplication(
    applicationId: string,
    reviewerId: string,
    action: 'APPROVE' | 'REJECT',
    notes?: string,
  ) {
    const targetStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const appRes = await this.database.query<{ user_id: string; business_name: string }>(
      `UPDATE partner_schema.applications
       SET status = $2, review_notes = $3, reviewed_by = $4, reviewed_at = now(), updated_at = now()
       WHERE id = $1
       RETURNING user_id, business_name`,
      [applicationId, targetStatus, notes || null, reviewerId],
    );
    const app = appRes.rows[0];
    if (!app) throw new Error('Không tìm thấy hồ sơ đối tác.');

    if (action === 'APPROVE') {
      // Elevate platform role to PARTNER in profiles
      const prevRoleRes = await this.database.query<{ role: string }>(
        `SELECT role FROM users_schema.profiles WHERE id = $1`,
        [app.user_id],
      );
      const prevRole = prevRoleRes.rows[0]?.role || 'USER';

      await this.database.query(
        `UPDATE users_schema.profiles SET role = 'PARTNER', updated_at = now() WHERE id = $1`,
        [app.user_id],
      );

      // Audit trail
      await this.database.query(
        `INSERT INTO audit_schema.role_audit_logs (actor_id, target_user_id, previous_role, new_role, reason)
         VALUES ($1, $2, $3, 'PARTNER', $4)`,
        [reviewerId, app.user_id, prevRole, `Phê duyệt đối tác kinh doanh: ${app.business_name}`],
      );
    }

    return { id: applicationId, status: targetStatus };
  }

  async listListings(partnerId: string): Promise<PartnerListingRecord[]> {
    const res = await this.database.query<{
      id: string;
      partner_id: string;
      title: string;
      description: string;
      category: string;
      location_name: string;
      price_amount: string;
      price_currency: string;
      media_urls: string[];
      status: string;
      created_at: string;
    }>(
      `SELECT id, partner_id, title, description, category, location_name,
              price_amount, price_currency, media_urls, status, created_at
       FROM partner_schema.listings
       WHERE partner_id = $1 AND status != 'ARCHIVED'
       ORDER BY created_at DESC`,
      [partnerId],
    );
    return res.rows.map((r) => ({
      id: r.id,
      partnerId: r.partner_id,
      title: r.title,
      description: r.description,
      category: r.category as PartnerListingRecord['category'],
      locationName: r.location_name,
      priceAmount: parseFloat(r.price_amount),
      priceCurrency: r.price_currency,
      mediaUrls: r.media_urls || [],
      status: r.status as PartnerListingRecord['status'],
      createdAt: r.created_at,
    }));
  }

  async createListing(
    partnerId: string,
    data: {
      title: string;
      description: string;
      category: string;
      locationName: string;
      priceAmount: number;
      priceCurrency?: string;
      mediaUrls?: string[];
      status?: string;
    },
  ): Promise<PartnerListingRecord> {
    const res = await this.database.query<{
      id: string;
      partner_id: string;
      title: string;
      description: string;
      category: string;
      location_name: string;
      price_amount: string;
      price_currency: string;
      media_urls: string[];
      status: string;
      created_at: string;
    }>(
      `INSERT INTO partner_schema.listings
        (partner_id, title, description, category, location_name, price_amount, price_currency, media_urls, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, partner_id, title, description, category, location_name,
                 price_amount, price_currency, media_urls, status, created_at`,
      [
        partnerId,
        data.title,
        data.description,
        data.category,
        data.locationName,
        data.priceAmount,
        data.priceCurrency || 'VND',
        data.mediaUrls || [],
        data.status || 'ACTIVE',
      ],
    );
    const r = res.rows[0]!;
    return {
      id: r.id,
      partnerId: r.partner_id,
      title: r.title,
      description: r.description,
      category: r.category as PartnerListingRecord['category'],
      locationName: r.location_name,
      priceAmount: parseFloat(r.price_amount),
      priceCurrency: r.price_currency,
      mediaUrls: r.media_urls,
      status: r.status as PartnerListingRecord['status'],
      createdAt: r.created_at,
    };
  }

  async updateListing(
    partnerId: string,
    listingId: string,
    data: Partial<{
      title: string;
      description: string;
      category: string;
      locationName: string;
      priceAmount: number;
      priceCurrency: string;
      mediaUrls: string[];
      status: string;
    }>,
  ) {
    const fields: string[] = [];
    const values: any[] = [partnerId, listingId];
    let idx = 3;

    if (data.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }
    if (data.category !== undefined) {
      fields.push(`category = $${idx++}`);
      values.push(data.category);
    }
    if (data.locationName !== undefined) {
      fields.push(`location_name = $${idx++}`);
      values.push(data.locationName);
    }
    if (data.priceAmount !== undefined) {
      fields.push(`price_amount = $${idx++}`);
      values.push(data.priceAmount);
    }
    if (data.priceCurrency !== undefined) {
      fields.push(`price_currency = $${idx++}`);
      values.push(data.priceCurrency);
    }
    if (data.mediaUrls !== undefined) {
      fields.push(`media_urls = $${idx++}`);
      values.push(data.mediaUrls);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(data.status);
    }

    if (fields.length === 0) return { id: listingId };

    fields.push('updated_at = now()');

    await this.database.query(
      `UPDATE partner_schema.listings
       SET ${fields.join(', ')}
       WHERE partner_id = $1 AND id = $2`,
      values,
    );
    return { id: listingId };
  }

  async deleteListing(partnerId: string, listingId: string) {
    await this.database.query(
      `UPDATE partner_schema.listings SET status = 'ARCHIVED', updated_at = now() WHERE partner_id = $1 AND id = $2`,
      [partnerId, listingId],
    );
    return { id: listingId, archived: true };
  }

  async listAllUsersForAdmin() {
    const res = await this.database.query<{
      id: string;
      full_name: string | null;
      email: string | null;
      role: string;
      status: string;
      created_at: string;
    }>(
      `SELECT p.id, p.full_name, u.email, p.role, p.status, p.created_at
       FROM users_schema.profiles p
       LEFT JOIN auth.users u ON u.id = p.id
       ORDER BY p.created_at DESC LIMIT 100`,
    );
    return res.rows.map((r) => ({
      id: r.id,
      fullName: r.full_name || 'Người dùng',
      email: r.email || 'Không có email',
      role: r.role,
      status: r.status,
      createdAt: r.created_at,
    }));
  }
}
