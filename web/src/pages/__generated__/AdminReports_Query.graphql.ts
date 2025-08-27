/**
 * @generated SignedSource<<83af7a602315659d4e6d97d493e63ada>>
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
  }
],
v1 = [
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
          }
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
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminReports_Query",
    "selections": (v1/*: any*/)
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

(node as any).hash = "43668786162d964b4f69f8ae99cb8864";

export default node;
