/**
 * Common module boundary rules based on project types.
 */
const typeConstraints = [
  {
    sourceTag: 'type:application',
    onlyDependOnLibsWithTags: [
      'type:feature',
      'type:data-access',
      'type:ui',
      'type:util',
      'type:unit-testing',
    ],
  },
  {
    sourceTag: 'type:feature',
    onlyDependOnLibsWithTags: [
      'type:data-access',
      'type:ui',
      'type:util',
      'type:unit-testing',
    ],
  },
  {
    sourceTag: 'type:data-access',
    onlyDependOnLibsWithTags: [
      'type:data-access',
      'type:ui',
      'type:util',
      'type:unit-testing',
    ],
  },
  {
    sourceTag: 'type:ui',
    onlyDependOnLibsWithTags: [
      'type:data-access',
      'type:ui',
      'type:util',
      'type:unit-testing',
    ],
  },
  {
    sourceTag: 'type:util',
    onlyDependOnLibsWithTags: ['type:data-access', 'type:ui', 'type:util'],
  },
  {
    sourceTag: 'type:e2e',
    onlyDependOnLibsWithTags: ['type:util'],
  },
];

/**
 * Shared module boundary rules based on scopes.
 */
const sharedConstraints = [
  {
    sourceTag: 'scope:tools',
    onlyDependOnLibsWithTags: [],
  },
];

/**
 * Backend module boundary rules based on scopes.
 */
const backendConstraints = [];

/**
 * Client module boundary rules based on scopes.
 */
const clientConstraints = [
  {
    sourceTag: 'scope:webaudio-spectrum-analyser',
    onlyDependOnLibsWithTags: [],
  },
  {
    sourceTag: 'scope:webaudio-spectrum-analyser-e2e',
    onlyDependOnLibsWithTags: [],
  },
];

/**
 * Nrwl nx module boudary rules.
 */
exports.nxModuleBoundaryRules = {
  enforceBuildableLibDependency: true,
  allow: [],
  depConstraints: [
    ...sharedConstraints,
    ...clientConstraints,
    ...backendConstraints,
    ...typeConstraints,
  ],
};
