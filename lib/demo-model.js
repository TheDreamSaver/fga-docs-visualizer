const direct = { this: {} };
const computed = relation => ({ computedUserset: { relation } });
const from = relation => ({ tupleToUserset: { tupleset: { relation: 'parent_project' }, computedUserset: { relation } } });
const union = (...child) => ({ union: { child } });
// JSON uses the API's snake_case keys; camelCase helpers are converted below.
const refs = [{ type: 'user' }, { type: 'team', relation: 'member' }];
const type = (name, relations, references) => ({ type: name, relations, metadata: { relations: Object.fromEntries(Object.entries(references).map(([key, directly_related_user_types]) => [key, { directly_related_user_types }])) } });
const model = { schema_version: '1.1', type_definitions: [
  { type: 'user' },
  type('team', { member: direct }, { member: [{ type: 'user' }] }),
  type('project', { admin: direct, editor: union(direct, computed('admin')), viewer: union(direct, computed('editor')) }, { admin: refs, editor: refs, viewer: refs }),
  type('document', { parent_project: direct, public: direct, admin: union(direct, from('admin')), editor: union(direct, from('editor'), computed('admin')), viewer: union(direct, from('viewer'), computed('editor'), computed('public')) }, { parent_project: [{ type: 'project' }], public: [{ type: 'user', wildcard: {} }], admin: refs, editor: refs, viewer: refs }),
] };
const apiModel = JSON.parse(JSON.stringify(model).replaceAll('computedUserset', 'computed_userset').replaceAll('tupleToUserset', 'tuple_to_userset'));
const documents = ['public_api_docs','architecture_v3','internal_sdk','finance_performance','design_mockups','core_engine'];
const tuples = [
  { user: 'user:ceo_sandra', relation: 'member', object: 'team:exec' },
  { user: 'user:lead_dev_raj', relation: 'member', object: 'team:engineering' },
  { user: 'user:junior_dev_chloe', relation: 'member', object: 'team:engineering' },
  { user: 'user:sales_bob', relation: 'member', object: 'team:sales' },
  { user: 'team:exec#member', relation: 'admin', object: 'project:odyssey' },
  ...documents.map(name => ({ user: 'project:odyssey', relation: 'parent_project', object: `document:${name}` })),
  ...['internal_sdk','design_mockups','core_engine'].map(name => ({ user: 'user:lead_dev_raj', relation: 'viewer', object: `document:${name}` })),
  { user: 'user:junior_dev_chloe', relation: 'viewer', object: 'document:core_engine' },
  { user: 'user:*', relation: 'public', object: 'document:public_api_docs' },
];
module.exports = { model: apiModel, tuples };
