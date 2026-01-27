import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { LogDelivery } from './LogDelivery';

interface Props extends cdk.StackProps {
  zone: string;
  subZone: string;
}

export class TpgSolverStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    { zone: zoneName, subZone, ...props }: Props
  ) {
    super(scope, id, props);

    const domainName = [subZone, zoneName].join('.');
    const zone = route53.HostedZone.fromLookup(this, 'zone', {
      domainName: zoneName,
    });
    const bucket = new s3.Bucket(this, 'bucket', {
      bucketName: domainName,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });
    const certificate = new acm.Certificate(this, 'certEc', {
      domainName,
      validation: acm.CertificateValidation.fromDns(zone),
      keyAlgorithm: acm.KeyAlgorithm.EC_PRIME256V1,
    });
    const responseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(
      this,
      'responseHeadersPolicy',
      {
        comment: `response headers for ${domainName}`,
        securityHeadersBehavior: {
          contentTypeOptions: { override: true },
          frameOptions: {
            frameOption: cloudfront.HeadersFrameOption.SAMEORIGIN,
            override: true,
          },
          referrerPolicy: {
            referrerPolicy:
              cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
            override: true,
          },
          strictTransportSecurity: {
            override: true,
            accessControlMaxAge: cdk.Duration.seconds(31536000),
          },
          xssProtection: {
            override: true,
            protection: true,
            modeBlock: true,
          },
        },
        removeHeaders: ['x-amz-server-side-encryption', 'server'],
      }
    );
    const distribution = new cloudfront.Distribution(this, 'distribution', {
      certificate,
      defaultBehavior: {
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        responseHeadersPolicy,
      },
      defaultRootObject: 'index.html',
      domainNames: [domainName],
      enableIpv6: true,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 404,
          responsePagePath: '/404.txt',
        },
      ],
    });
    new LogDelivery(this, 'logDelivery', {
      distribution,
      logGroupName: `/access/` + domainName,
    });
    new route53.ARecord(this, 'arecord', {
      zone,
      recordName: subZone,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)
      ),
    });
    new route53.AaaaRecord(this, 'aaaarecord', {
      zone,
      recordName: subZone,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)
      ),
    });

    new cdk.CfnOutput(this, 'distributionid', {
      value: distribution.distributionId,
    });
  }
}
