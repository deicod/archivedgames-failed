import { Environment, Network, RecordSource, Store, FetchFunction } from 'relay-runtime';

const fetchGraphQL: FetchFunction = async (params, variables) => {
  const token = window.localStorage.getItem('access_token');
  const res = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ query: params.text, variables })
  });
  return await res.json();
};

export const environment = new Environment({
  network: Network.create(fetchGraphQL),
  store: new Store(new RecordSource())
});
