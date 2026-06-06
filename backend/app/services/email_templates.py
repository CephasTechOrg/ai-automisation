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
