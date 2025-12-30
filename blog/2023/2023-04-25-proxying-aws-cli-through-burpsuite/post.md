---
title: "Proxying the AWS CLI through Burp Suite."
description: Ever wondered what the AWS CLI is actually doing on the wire? In this post, I show you how to hook any CLI tool through Burp Suite so you can take a peek under the covers!
slug: proxying-aws-through-burp
date: 2023-04-25T20:00:00+01:00
category: technology
tags: [aws, cli, burpsuite, proxy, internals]
cover: ./images/cover.png
---

Most people think of HTTP proxies like Burp Suite or [mitmproxy](https://mitmproxy.org/) as tools for web security or pentesting, but they are also great for development, testing, and exploring APIs. I often use Burp to learn about or reverse-engineer APIs. In this post, I'll show you how to use Burp to see how the AWS CLI sends HTTP requests. First, make sure you have the right tools installed. The installation is simple on any OS, but if you run into any issues make sure to read the [AWS CLI Getting Started Docs](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and the [Burp Suite Installation Guide](https://portswigger.net/burp/releases/community/latest).

```bash
brew install awscli burp-suite
```

Once you start Burp, it creates a proxy at http://localhost:8080. With the AWS CLI ready, set these environment variables in your shell to send traffic through Burp Suite.

```bash frame="none"
export HTTP_PROXY=http://localhost:8080
export HTTPS_PROXY=http://localhost:8080
```

That’s all you need. Now, try it out and see if Burp shows any requests to AWS.

```bash withOutput wrap
$ aws sts get-caller-identity

SSL validation failed for https://sts.us-east-1.amazonaws.com/ [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: self signed certificate in certificate chain (_ssl.c:992)
```

You’ll see an SSL error. This happens because Burp Suite creates its own certificates for HTTPS traffic, but your system doesn’t trust its certificate authority by default. To fix this, download the CA certificate from Burp and tell the AWS CLI to trust it.

```sh frame="none"
curl http://127.0.0.1:8080/cert --output ./certificate.cer
openssl x509 -inform der -in ./certificate.cer -out ./certificate.pem
export AWS_CA_BUNDLE="$(pwd)/certificate.pem"
```

That’s it. Now, all traffic from the AWS CLI will go through Burp:

![Burp Suite Proxy Tab Example](./images/burp-example.png)

Putting it all together, we can write this up in just a few lines:

```sh title="proxy_aws_cli_through_burp.sh"
export HTTP_PROXY=http://localhost:8080
export HTTPS_PROXY=http://localhost:8080
export AWS_CA_BUNDLE=/dev/shm/cert.pem
curl -s http://127.0.0.1:8080/cert | openssl x509 -inform der -out "$AWS_CA_BUNDLE"
```

## Conclusion

The best part is that you can use this method to debug many other CLI tools. Most CLI tools for popular services just send HTTP requests, so checking the traffic can be very helpful. Many SDKs work the same way. If you’re coding in Node, Python, or another language, this trick can give you useful insights. As shown earlier, just set the \*\_PROXY environment variables to point to your HTTP proxy and make sure the CLI or SDK trusts the self-signed CA certificate. The details for trusting the certificate will vary by tool or language.
