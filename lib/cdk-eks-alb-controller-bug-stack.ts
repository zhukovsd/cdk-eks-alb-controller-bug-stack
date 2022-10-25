import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as eks from "aws-cdk-lib/aws-eks";

export class CdkEksAlbControllerBugStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cluster = new eks.Cluster(this, "eks-cluster", {
      version: eks.KubernetesVersion.V1_21,
      albController: {
        version: eks.AlbControllerVersion.V2_4_1
      },
    });

    const ingress = {
      apiVersion: "networking.k8s.io/v1",
      kind: "Ingress",
      metadata: {
        name: "sample-ingress"
      },
      spec: {
        ingressClassName: "alb",
        defaultBackend: {
          service: {
            name: "default-http-backend",
            port: {
              number: 80
            }
          }
        },
        rules: [{
          host: "example.com",
          http: {
            paths: [{
              path: "/*",
              pathType: "ImplementationSpecific",
              backend: {
                service: {
                  name: "sample",
                  port: {
                    number: 80
                  }
                }
              }
            }]
          }
        }]
      }
    };

    const manifest = new eks.KubernetesManifest(this, "ingress-manifest", {
      cluster, manifest: [ingress],
    });
  }
}
