# File-Sign Delivery Receipt

{% assign sa = sending.sender.sendingApproval %}{% assign ra = reception.recipient.receptionApproval %}{% assign cert = fileSignCert.x509Chain[0] %}
Message #**{{ sa.messageId }}** sent by **{{ sa.senderEmail }}** to **{{ sa.recipientEmail }}** {% if ra %}{% endif %}.

## Message

> blockquote test: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus molestie mi nec purus vehicula, et fermentum lacus pulvinar. Aliquam lacinia dui et odio sagittis sollicitudin.

| Col1 | Col2 |
|---|---|
| Title | **{{ sa.title }}** |
| Body | {{ sending.body }} |

## Attached files ({{ sa.files | size }})

| Name | Size | SHA-256 |
|---|---|---|
{% for f in sa.files %}| **{{ f.filename }}** {% if ra %}{% endif %} | {{ f.size | divided_by: 1024.0 | round: 1 }} KB | `{{ f.sha256 }}` {% if ra %}{% endif %} |
{% endfor %}
{% if ra %}## Blockchain anchoring

`{{ ra.virtualBlockchainId }}`

{% endif %}---
