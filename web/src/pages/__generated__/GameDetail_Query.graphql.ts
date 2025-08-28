/**
 * @generated SignedSource<<4edd3639925e23757166842c6f83add8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GamePlatform = "AMIGA" | "C64" | "DOS" | "%future added value";
export type ImageKind = "COVER" | "GALLERY" | "%future added value";
export type GameDetail_Query$variables = {
  slug: string;
};
export type GameDetail_Query$data = {
  readonly games: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly comments: {
          readonly edges: ReadonlyArray<{
            readonly node: {
              readonly contentSanitized: string;
              readonly createdAt: any;
              readonly deletedAt: any | null | undefined;
              readonly editedAt: any | null | undefined;
              readonly id: string;
              readonly userID: string;
            } | null | undefined;
          } | null | undefined> | null | undefined;
        };
        readonly files: {
          readonly edges: ReadonlyArray<{
            readonly node: {
              readonly format: string | null | undefined;
              readonly id: string;
              readonly originalName: string;
              readonly reactionSummary: {
                readonly down: number;
                readonly up: number;
                readonly viewer: number;
              };
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
        readonly likes: {
          readonly totalCount: number;
        };
        readonly platform: GamePlatform;
        readonly publisher: string | null | undefined;
        readonly slug: string;
        readonly title: string;
        readonly viewerDidLike: boolean;
        readonly year: number | null | undefined;
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
    "kind": "Literal",
    "name": "first",
    "value": 50
  }
],
v3 = [
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
                "args": null,
                "kind": "ScalarField",
                "name": "year",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "publisher",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "GameLikeConnection",
                "kind": "LinkedField",
                "name": "likes",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "totalCount",
                    "storageKey": null
                  }
                ],
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
                "args": (v2/*: any*/),
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
                          },
                          {
                            "kind": "ClientExtension",
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "ReactionSummary",
                                "kind": "LinkedField",
                                "name": "reactionSummary",
                                "plural": false,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "up",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "down",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "viewer",
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ]
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "files(first:50)"
              },
              {
                "alias": null,
                "args": (v2/*: any*/),
                "concreteType": "CommentConnection",
                "kind": "LinkedField",
                "name": "comments",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "CommentEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Comment",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v1/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "userID",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "contentSanitized",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "createdAt",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "editedAt",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "deletedAt",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "comments(first:50)"
              },
              {
                "kind": "ClientExtension",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "viewerDidLike",
                    "storageKey": null
                  }
                ]
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
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "GameDetail_Query",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "56a5be892ec60e27e921d39c8703708f",
    "id": null,
    "metadata": {},
    "name": "GameDetail_Query",
    "operationKind": "query",
    "text": "query GameDetail_Query(\n  $slug: String!\n) {\n  games(first: 1, where: {slug: $slug}) {\n    edges {\n      node {\n        id\n        slug\n        title\n        year\n        publisher\n        platform\n        likes {\n          totalCount\n        }\n        images(first: 4) {\n          edges {\n            node {\n              id\n              s3Key\n              width\n              height\n              kind\n            }\n          }\n        }\n        files(first: 50) {\n          edges {\n            node {\n              id\n              originalName\n              sizeBytes\n              format\n            }\n          }\n        }\n        comments(first: 50) {\n          edges {\n            node {\n              id\n              userID\n              contentSanitized\n              createdAt\n              editedAt\n              deletedAt\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "035a85f2033f51b86470e0e43a5f21b2";

export default node;
