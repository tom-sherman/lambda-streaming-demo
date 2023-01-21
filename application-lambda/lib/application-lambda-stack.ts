import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

interface ApplicationLambdaStackProps extends cdk.StackProps {
  socketConnectionUrl: string;
}

export class ApplicationLambdaStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    { socketConnectionUrl, ...props }: ApplicationLambdaStackProps
  ) {
    super(scope, id, props);

    const lambda = new NodejsFunction(this, "Lambda", {
      entry: "src/lambda.ts",
      environment: {
        SOCKET_CONNECTION_URL: socketConnectionUrl,
      },
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(15),
    });

    const lambdaUrl = lambda.addFunctionUrl({
      authType: cdk.aws_lambda.FunctionUrlAuthType.NONE,
    });

    new cdk.CfnOutput(this, "LambdaUrl", {
      value: lambdaUrl.url,
    });
  }
}
