/**
 * @generated SignedSource<<7449866851097a9cbbd9c9874a56dc55>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ImageKind = "COVER" | "GALLERY" | "%future added value";
export type GameDetail_Query$variables = {
  slug: string;
};
export type GameDetail_Query$data = {
  readonly games: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly files: {
          readonly edges: ReadonlyArray<{
            readonly node: {
              readonly format: string | null | undefined;
              readonly id: string;
              readonly originalName: string;
              readonly sizeBytes: number;
            } | null | undefined;
          } | null | undefined> | null | undefined;
        };
        readonly id: string;
        readonly images: {
          readonly edges: ReadonlyArray<{
            readonly node: {
              readonly height: number;
              readonly id: string;
              readonly kind: ImageKind;
              readonly s3Key: string;
              readonly width: number;
            } | null | undefined;
          } | null | undefined> | null | undefined;
        };
        readonly slug: string;
        readonly title: string;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
};
export type GameDetail_Query = {
  response: GameDetail_Query$data;
  variables: GameDetail_Query$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "first",
        "value": 1
      },
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "slug",
            "variableName": "slug"
          }
        ],
        "kind": "ObjectValue",
        "name": "where"
      }
    ],
    "concreteType": "GameConnection",
    "kind": "LinkedField",
    "name": "games",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "GameEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Game",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              (v1/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "slug",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "title",
                "storageKey": null
              },
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "first",
                    "value": 4
                  }
                ],
                "concreteType": "ImageConnection",
                "kind": "LinkedField",
                "name": "images",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ImageEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Image",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v1/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "s3Key",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "width",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "height",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "kind",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "images(first:4)"
              },
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "first",
                    "value": 50
                  }
                ],
                "concreteType": "FileConnection",
                "kind": "LinkedField",
                "name": "files",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "FileEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "File",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v1/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "originalName",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "sizeBytes",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "format",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "files(first:50)"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "GameDetail_Query",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "GameDetail_Query",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "aaef63553d8cab65d2a4d2bc8f5fa828",
    "id": null,
    "metadata": {},
    "name": "GameDetail_Query",
    "operationKind": "query",
    "text": "query GameDetail_Query(\n  $slug: String!\n) {\n  games(first: 1, where: {slug: $slug}) {\n    edges {\n      node {\n        id\n        slug\n        title\n        images(first: 4) {\n          edges {\n            node {\n              id\n              s3Key\n              width\n              height\n              kind\n            }\n          }\n        }\n        files(first: 50) {\n          edges {\n            node {\n              id\n              originalName\n              sizeBytes\n              format\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9f0be86774d76b524dd94c51f112b224";

export default node;
