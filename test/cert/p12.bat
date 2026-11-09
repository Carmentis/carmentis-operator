REM ECDSA P-256 key, then self-signed certificate valid one year
openssl ecparam -name prime256v1 -genkey -noout -out key.pem
openssl req -new -x509 -key key.pem -out cert.pem -days 365 -sha256 -config cert.cnf

REM Bundle key + certificate into a p12
openssl pkcs12 -export -inkey key.pem -in cert.pem -name "Demo Operator" -out demo.p12 -passout pass:demo
