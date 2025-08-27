/**
 * @generated SignedSource<<1ad977c84a67ffeaa791b1c9acd081e0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GamePlatform = "AMIGA" | "C64" | "DOS" | "%future added value";
export type PlatformList_Query$variables = {
  after?: any | null | undefined;
  first: number;
  platform: GamePlatform;
};
export type PlatformList_Query$data = {
  readonly games: {
    readonly edges: ReadonlyArray<{
      readonly cursor: any;
      readonly node: {
        readonly id: string;
        readonly slug: string;
        readonly title: string;
      } | null | undefined;
    } | null | undefined> | null | undefined;
    readonly pageInfo: {
      readonly endCursor: any | null | undefined;
      readonly hasNextPage: boolean;
    };
  };
};
export type PlatformList_Query = {
  response: PlatformList_Query$data;
  variables: PlatformList_Query$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "platform"
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "after",
        "variableName": "after"
      },
      {
        "kind": "Variable",
        "name": "first",
        "variableName": "first"
      },
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "platform",
            "variableName": "platform"
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
            "kind": "ScalarField",
            "name": "cursor",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Game",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
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
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "PageInfo",
        "kind": "LinkedField",
        "name": "pageInfo",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "hasNextPage",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "endCursor",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "PlatformList_Query",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "PlatformList_Query",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "0e8e837d77274d7cb031cfc1f3578845",
    "id": null,
    "metadata": {},
    "name": "PlatformList_Query",
    "operationKind": "query",
    "text": "query PlatformList_Query(\n  $platform: GamePlatform!\n  $first: Int!\n  $after: Cursor\n) {\n  games(where: {platform: $platform}, first: $first, after: $after) {\n    edges {\n      cursor\n      node {\n        id\n        slug\n        title\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "42db9bcf4e621dc5a4ee5cfd334c6fd9";

export default node;
