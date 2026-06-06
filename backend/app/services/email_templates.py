def _base(business_name: str, brand_color: str, preview: str, body_html: str) -> str:
    """Wraps body_html in a professional, inbox-safe single-column template."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{business_name}</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <!-- preview text (hidden) -->
  <span style="display:none;max-height:0;overflow:hidden;">{preview}</span>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header bar -->
        <tr>
          <td style="background:{brand_color};border-radius:12px 12px 0 0;padding:24px 32px;">
            <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">{business_name}</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:32px 32px 28px;border-left:1px solid #E4E4E7;border-right:1px solid #E4E4E7;">
            {body_html}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#FAFAFA;border:1px solid #E4E4E7;border-top:none;border-radius:0 0 12px 12px;padding:18px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#71717A;line-height:1.6;">
              You received this email because you submitted a quote request with
              <strong style="color:#52525B;">{business_name}</strong>.<br>
              Powered by <strong style="color:#52525B;">LeadFlow Pro</strong>.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


def acknowledgement_html(
    business_name: str,
    customer_name: str,
    brand_color: str = '#2563EB',
) -> str:
    """Safe, always-on acknowledgement. Makes no promises beyond receipt."""
    first = customer_name.split()[0]
    body = f"""
      <p style="margin:0 0 20px;font-size:15px;color:#18181B;line-height:1.7;">
        Hi <strong>{first}</strong>,
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#18181B;line-height:1.8;">
        Thank you for contacting <strong>{business_name}</strong>. We have received your request
        and a member of our team will follow up with you as soon as possible.
      </p>
      <p style="margin:0 0 28px;font-size:14px;color:#52525B;line-height:1.7;">
        If you have any urgent questions in the meantime, feel free to reply directly to this email.
      </p>
      <p style="margin:0;font-size:14px;color:#52525B;line-height:1.6;">
        Best regards,<br>
        <strong style="color:#18181B;">{business_name}</strong>
      </p>
    """
    preview = f"We received your request — {business_name} will be in touch soon."
    return _base(business_name, brand_color, preview, body)


def auto_reply_html(
    business_name: str,
    customer_name: str,
    content: str,
    brand_color: str = '#2563EB',
) -> str:
    """AI-generated reply sent automatically to the customer on lead submission."""
    first = customer_name.split()[0]
    body = f"""
      <p style="margin:0 0 20px;font-size:15px;color:#18181B;line-height:1.7;">
        Hi <strong>{first}</strong>,
      </p>
      <p style="margin:0 0 16px;font-size:14px;color:#71717A;">
        Thank you for reaching out — we received your request and wanted to get back to you right away.
      </p>
      <div style="margin:0 0 28px;padding:20px 22px;border-left:3px solid {brand_color};background:#F9FAFB;font-size:15px;color:#18181B;line-height:1.8;white-space:pre-wrap;">{content}</div>
      <p style="margin:0 0 24px;font-size:14px;color:#52525B;line-height:1.6;">
        A member of our team will follow up with you shortly. If you have any questions in the meantime, simply reply to this email.
      </p>
      <p style="margin:0;font-size:14px;color:#52525B;line-height:1.6;">
        Best regards,<br>
        <strong style="color:#18181B;">{business_name}</strong>
      </p>
    """
    preview = f"Thanks for reaching out! Here's an update from {business_name}…"
    return _base(business_name, brand_color, preview, body)


def owner_alert_html(
    business_name: str,
    customer_name: str,
    customer_email: str | None,
    customer_phone: str | None,
    service_needed: str | None,
    customer_message: str | None,
    ai_reply: str,
    dashboard_url: str,
    brand_color: str = '#2563EB',
    auto_sent: bool = False,
    block_reason: str | None = None,
) -> str:
    """Rich new-lead alert sent to the business owner. Includes lead details + AI draft or auto-reply status."""
    def row(label: str, value: str | None) -> str:
        if not value:
            return ''
        return f"""
          <tr>
            <td style="padding:8px 0;font-size:13px;color:#71717A;width:120px;vertical-align:top;">{label}</td>
            <td style="padding:8px 0;font-size:13px;color:#18181B;font-weight:500;">{value}</td>
          </tr>"""

    details_rows = (
        row('Name', customer_name)
        + row('Email', customer_email)
        + row('Phone', customer_phone)
        + row('Service', service_needed)
    )

    message_block = ''
    if customer_message:
        message_block = f"""
          <p style="margin:24px 0 10px;font-size:13px;font-weight:600;color:#71717A;text-transform:uppercase;letter-spacing:.05em;">Their message</p>
          <div style="padding:16px 18px;background:#F4F4F5;border-radius:8px;font-size:14px;color:#18181B;line-height:1.7;white-space:pre-wrap;">{customer_message}</div>"""

    if auto_sent:
        ai_box = f"""
          <div style="margin:24px 0;padding:16px 18px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#15803D;text-transform:uppercase;letter-spacing:.05em;">&#10003; AI auto-replied to the customer</p>
            <div style="font-size:14px;color:#18181B;line-height:1.7;white-space:pre-wrap;">{ai_reply}</div>
          </div>"""
    else:
        reason_text = ''
        if block_reason:
            labels = {
                'smart_auto_reply_disabled': 'Smart auto-reply is off for this business.',
                'owner_approval_required': 'Owner approval is required before sending.',
                'business_not_active': 'Business is not active.',
            }
            reason_text = f'<p style="margin:8px 0 0;font-size:12px;color:#92400E;">{labels.get(block_reason, block_reason.replace("_", " ").capitalize())}</p>'
        ai_box = f"""
          <div style="margin:24px 0;padding:16px 18px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:.05em;">&#9998; AI draft saved — awaiting your review</p>
            <div style="font-size:14px;color:#18181B;line-height:1.7;white-space:pre-wrap;">{ai_reply}</div>
            {reason_text}
          </div>"""

    body = f"""
      <div style="display:inline-block;padding:4px 12px;background:{brand_color}18;border-radius:20px;margin-bottom:18px;">
        <span style="font-size:12px;font-weight:700;color:{brand_color};text-transform:uppercase;letter-spacing:.06em;">New Lead</span>
      </div>
      <h2 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#18181B;letter-spacing:-0.3px;">{customer_name}</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#71717A;">submitted a quote request just now.</p>

      <table cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #E4E4E7;">
        {details_rows}
      </table>
      {message_block}
      {ai_box}

      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:{brand_color};border-radius:8px;padding:12px 24px;">
            <a href="{dashboard_url}" style="color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">View in Dashboard →</a>
          </td>
        </tr>
      </table>
    """
    preview = (
        f"New lead from {customer_name} — AI replied automatically. Tap to view."
        if auto_sent
        else f"New lead from {customer_name} — AI draft ready for your review."
    )
    return _base(business_name, brand_color, preview, body)


def owner_reply_html(
    business_name: str,
    customer_name: str,
    content: str,
    brand_color: str = '#2563EB',
) -> str:
    first = customer_name.split()[0]
    body = f"""
      <p style="margin:0 0 20px;font-size:15px;color:#18181B;line-height:1.7;">
        Hi <strong>{first}</strong>,
      </p>
      <div style="margin:0 0 24px;font-size:15px;color:#18181B;line-height:1.8;white-space:pre-wrap;">{content}</div>
      <p style="margin:0;font-size:14px;color:#52525B;line-height:1.6;">
        Best regards,<br>
        <strong style="color:#18181B;">{business_name}</strong>
      </p>
    """
    preview = f"Message from {business_name}: {content[:80].strip()}…"
    return _base(business_name, brand_color, preview, body)


def followup_html(
    business_name: str,
    customer_name: str,
    content: str,
    brand_color: str = '#2563EB',
) -> str:
    first = customer_name.split()[0]
    body = f"""
      <p style="margin:0 0 20px;font-size:15px;color:#18181B;line-height:1.7;">
        Hi <strong>{first}</strong>,
      </p>
      <div style="margin:0 0 28px;font-size:15px;color:#18181B;line-height:1.8;white-space:pre-wrap;">{content}</div>
      <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr>
          <td style="background:{brand_color};border-radius:8px;padding:12px 24px;">
            <span style="color:#ffffff;font-size:14px;font-weight:600;">Reply to this email to get in touch</span>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:14px;color:#52525B;line-height:1.6;">
        Best regards,<br>
        <strong style="color:#18181B;">{business_name}</strong>
      </p>
    """
    preview = f"Following up from {business_name}: {content[:80].strip()}…"
    return _base(business_name, brand_color, preview, body)
