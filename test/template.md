# File-Sign Delivery Receipt

{% assign sa = sending.sender.sendingApproval.__signature__ %}{% assign ra = reception.recipient.receptionApproval.__signature__ %}{% assign cert = fileSignCert.x509Chain[0] %}
Message #**{{ sa.payload.messageId }}** sent by **{{ sa.payload.senderEmail }}** [1][2] to **{{ sa.payload.recipientEmail }}** [2]{% if ra %}[3][4]{% endif %}.

- Sending approved on **{{ sa.context.signedAt | divided_by: 1000 | date: '%B %d, %Y at %H:%M:%S' }}** [2]
{% if ra %}- Reception approved on **{{ ra.context.signedAt | divided_by: 1000 | date: '%B %d, %Y at %H:%M:%S' }}** [4]
{% else %}- Reception: not yet approved
{% endif %}{% if cert %}- Sending service: **{{ cert.subject['2.5.4.3'].values[0] }}** [5]
{% endif %}
## Message

> blockquote test: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus molestie mi nec purus vehicula, et fermentum lacus pulvinar. Aliquam lacinia dui et odio sagittis sollicitudin.

| Col1 | Col2 |
|---|---|
| Title | **{{ sa.payload.title }}** [2] |
| Body | {{ sending.body }} |

## Attached files ({{ sa.payload.files | size }})

| Name | Size | SHA-256 |
|---|---|---|
{% for f in sa.payload.files %}| **{{ f.filename }}** [2]{% if ra %}[4]{% endif %} | {{ f.size | divided_by: 1024.0 | round: 1 }} KB | `{{ f.sha256 }}` [2]{% if ra %}[4]{% endif %} |
{% endfor %}
{% if ra %}## Blockchain anchoring

`{{ ra.payload.virtualBlockchainId }}` [4]

{% endif %}---

## Proofs

**[1] Sender email**: SD-JWT verifiable presentation (EmailCredential), with proof of possession.

**[2] Sending approval**: \"{{ sa.context.purpose }}\". {{ sa.signatureType }} signature, key `{{ sa.publicKey | truncate: 50 }}`. It covers the title, sender, recipient and files.

{% if ra %}**[3] Recipient email**: SD-JWT verifiable presentation (EmailCredential), with proof of possession.

**[4] Reception approval**: \"{{ ra.context.purpose }}\". {{ ra.signatureType }} signature, key `{{ ra.publicKey | truncate: 50 }}`. It covers the virtual blockchain identifier, sender, recipient and files.

{% endif %}{% if cert %}**[5] Service certificate**: subject {{ cert.subject['2.5.4.3'].values[0] }}, issuer {{ cert.issuer['2.5.4.3'].values[0] }}{% if cert.info.selfSigned %} (self-signed){% endif %}. Serial number `{{ cert.info.serialNumber }}`. Valid from {{ cert.info.notBefore | date: '%B %d, %Y' }} to {{ cert.info.notAfter | date: '%B %d, %Y' }}.
{% endif %}
