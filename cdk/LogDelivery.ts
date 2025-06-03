import { Names } from 'aws-cdk-lib';
import type * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface Props {
  distribution: cloudfront.IDistribution;
  logGroupName?: string;
  retention?: logs.RetentionDays;
}

export class LogDelivery extends Construct {
  constructor(
    scope: Construct,
    id: string,
    {
      distribution,
      logGroupName,
      retention = logs.RetentionDays.SIX_MONTHS,
    }: Props
  ) {
    super(scope, id);

    const source = new logs.CfnDeliverySource(this, 'source', {
      name: Names.uniqueResourceName(this, {}) + '-source',
      logType: 'ACCESS_LOGS',
      resourceArn: distribution.distributionArn,
    });

    this.logGroup = new logs.LogGroup(this, 'logs', {
      logGroupName,
      retention,
    });

    const destination = new logs.CfnDeliveryDestination(this, 'destination', {
      name: Names.uniqueResourceName(this, {}) + '-destination',
      destinationResourceArn: this.logGroup.logGroupArn,
      outputFormat: 'json',
    });

    const delivery = new logs.CfnDelivery(this, 'delivery', {
      deliverySourceName: source.name,
      deliveryDestinationArn: destination.attrArn,
    });
    delivery.addDependency(source);
  }

  public readonly logGroup: logs.LogGroup;
}
