/**
 * @generated SignedSource<<7a999b11bb39dc5855bbc7ae62138b64>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ReportStatus = "ACTIONED" | "OPEN" | "REJECTED" | "TRIAGED" | "%future added value";
export type AdminReports_Query$variables = {
  first: number;
  offset: number;
  subjectType?: string | null | undefined;
};
export type AdminReports_Query$data = {
  readonly reportsOpen: ReadonlyArray<{
    readonly id: string;
    readonly note: string | null | undefined;
    readonly reason: string;
    readonly status: ReportStatus;
    readonly subjectID: string;
    readonly subjectType: string;
  }>;
  readonly reportsOpenTotal: number;
};
export type AdminReports_Query = {
  response: AdminReports_Query$data;
  variables: AdminReports_Query$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "first"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "offset"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "subjectType"
  }
],
v1 = {
  "kind": "Variable",
  "name": "subjectType",
  "variableName": "subjectType"
},
v2 = [
  {
    "kind": "ClientExtension",
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "first",
            "variableName": "first"
          },
          {
            "kind": "Variable",
            "name": "offset",
            "variableName": "offset"
          },
          (v1/*: any*/)
        ],
        "concreteType": "Report",
        "kind": "LinkedField",
        "name": "reportsOpen",
        "plural": true,
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
            "name": "subjectType",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "subjectID",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "reason",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "note",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "status",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": [
          (v1/*: any*/)
        ],
        "kind": "ScalarField",
        "name": "reportsOpenTotal",
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminReports_Query",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminReports_Query",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "5f7ee2ed4a71cc6b9ad8a0efd7a90a01",
    "id": null,
    "metadata": {},
    "name": "AdminReports_Query",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "c9e316343cca1449f9792ccc83b7e6a5";

export default node;
