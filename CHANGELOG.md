## [1.5.6](https://github.com/Carmentis/carmentis-operator/compare/v1.5.5...v1.5.6) (2026-02-26)


### Bug Fixes

* include wallet relation in findApplicationByApiKey query ([8687685](https://github.com/Carmentis/carmentis-operator/commit/8687685d2de398f517e9a062f6c831aa56cbaeda))

## [1.5.5](https://github.com/Carmentis/carmentis-operator/compare/v1.5.4...v1.5.5) (2026-02-26)


### Bug Fixes

* update @cmts-dev/carmentis-sdk to v1.20, adjust gas computation logic in wallet anchoring service ([c8fb4b8](https://github.com/Carmentis/carmentis-operator/commit/c8fb4b8edec647633a3227cc0b0a22a4bd91c841))

## [1.5.4](https://github.com/Carmentis/carmentis-operator/compare/v1.5.3...v1.5.4) (2026-02-19)


### Bug Fixes

* add chainStorageInDays and gasPriceInAtomics to AnchorDto, update gas price logic ([0d6d9f3](https://github.com/Carmentis/carmentis-operator/commit/0d6d9f3f389e9be1059958e71fa6ed101737fc65))
* default operator storage updated ([30b48a8](https://github.com/Carmentis/carmentis-operator/commit/30b48a8fc9d346072ee21c141f356036284639fa))

## [1.5.3](https://github.com/Carmentis/carmentis-operator/compare/v1.5.2...v1.5.3) (2026-02-19)


### Bug Fixes

* **ci:** pnpm not found in Dockerfile and optimization ([1d7660c](https://github.com/Carmentis/carmentis-operator/commit/1d7660c1e79eb17342661c9b5ad8c1b2eed800a6))

## [1.5.2](https://github.com/Carmentis/carmentis-operator/compare/v1.5.1...v1.5.2) (2026-02-19)


### Bug Fixes

* **ci:** no output for semantic release ([c25e108](https://github.com/Carmentis/carmentis-operator/commit/c25e10800076a509993c354af7866c104aa6db6f))
* missing cache in the ci ([ce0fbcf](https://github.com/Carmentis/carmentis-operator/commit/ce0fbcfd488fc73a6bd52e48255b5d3d9db2ee7d))

## [1.5.1](https://github.com/Carmentis/carmentis-operator/compare/v1.5.0...v1.5.1) (2026-02-19)


### Bug Fixes

* usage of logger instead of console ([cbdfb7e](https://github.com/Carmentis/carmentis-operator/commit/cbdfb7ea411d34f825479c7b11f6f1f7944efb1d))

# [1.5.0](https://github.com/Carmentis/carmentis-operator/compare/v1.4.0...v1.5.0) (2026-02-19)


### Bug Fixes

* add missing dependencies to pnpm-lock.yaml ([8bb5dfe](https://github.com/Carmentis/carmentis-operator/commit/8bb5dfebf129fc1903fdc71fc25fd3ff874ad0bb))
* **ci:** node version is 20 instead of 22 or higher ([3f32a11](https://github.com/Carmentis/carmentis-operator/commit/3f32a11934e687cd61ebb0cde0652dab557fc28c))
* invalid nodejs setup with invalid cache ([dfaf28c](https://github.com/Carmentis/carmentis-operator/commit/dfaf28c3b0d902a21d433dd1f30c0a2d4d6e43f0))
* missing packages in the pnpm config ([ab8e0c1](https://github.com/Carmentis/carmentis-operator/commit/ab8e0c1147c64e88873afec9776e809d82cdcb62))
* override dependencies error in ci ([002cfd7](https://github.com/Carmentis/carmentis-operator/commit/002cfd7cf02b3e49a0e261792a5de7e0335b1127))


### Features

* **api-key:** extend API key management with toggle functionality and improve structure ([e57de60](https://github.com/Carmentis/carmentis-operator/commit/e57de6003fa1c723cf975ce95bdf80db6e1028ac))
* **api-key:** improve DTO validation, logging, and optional fields handling ([283cd5f](https://github.com/Carmentis/carmentis-operator/commit/283cd5ff42aa5e46b8b5fb6d5d2db0fad3c9261d))
* **auth:** add JwtTokenBearerGuard and improve exception handling ([9fd57a8](https://github.com/Carmentis/carmentis-operator/commit/9fd57a804fa79f78a8726b46e4c1af93fcecfbb5))
* **auth:** improve challenge verification, JWT handling, and setup process ([61d7a63](https://github.com/Carmentis/carmentis-operator/commit/61d7a63a39ff479d1a967129abec7dae217093db))
* **config:** add default SQLite configuration to OperatorConfig ([776bf81](https://github.com/Carmentis/carmentis-operator/commit/776bf81e3d0f97a71d604b5d6cc0b1cfa5218bd9))
* **dto:** add validation DTOs for API Key and Application creation ([f6a51e1](https://github.com/Carmentis/carmentis-operator/commit/f6a51e165ba00a5ef213daea56909ef299471de1))
* **env-service:** enhance JWT secret handling and integrate with operator config ([9d31b72](https://github.com/Carmentis/carmentis-operator/commit/9d31b72e38327c0b268474edeaa4113aa5c4072c))
* **operator-admin-api:** add CRUD controllers for Application, Wallet, and API Key management ([0d91dee](https://github.com/Carmentis/carmentis-operator/commit/0d91deefbcb3d2e8bf7bdde3000aa2ef4207b341))
* zero-config feature ([2a63ee3](https://github.com/Carmentis/carmentis-operator/commit/2a63ee3a771571aeb29aa4077656dbe73b9bc60a))

# [1.4.0](https://github.com/Carmentis/carmentis-operator/compare/v1.3.0...v1.4.0) (2026-02-17)


### Features

* **chain-service:** add caching mechanism and improve error handling ([1a33600](https://github.com/Carmentis/carmentis-operator/commit/1a3360072553983228b1c02d16f0d61159e0a76a))

# [1.3.0](https://github.com/Carmentis/carmentis-operator/compare/v1.2.3...v1.3.0) (2026-02-02)


### Bug Fixes

* bump version to 1.2.3 in package dependencies ([373d002](https://github.com/Carmentis/carmentis-operator/commit/373d0027616b520c065de0f0acaed52ca362ec43))
* upgrade SDK to 1.18.4 and update dependencies ([a51bc2d](https://github.com/Carmentis/carmentis-operator/commit/a51bc2d6e7f510914634f9e62b4d0f28014ad7c3))


### Features

* **chain-service:** add caching mechanism and improve error handling ([bec67cd](https://github.com/Carmentis/carmentis-operator/commit/bec67cd6b4c068d55d1c063505983974e902c849))

## [1.2.3](https://github.com/Carmentis/carmentis-operator/compare/v1.2.2...v1.2.3) (2026-02-02)


### Bug Fixes

* ugrade to SDK 1.18.3 ([c7f83a6](https://github.com/Carmentis/carmentis-operator/commit/c7f83a6074144fcd9096e01890e583a36856163d))

## [1.2.2](https://github.com/Carmentis/carmentis-operator/compare/v1.2.1...v1.2.2) (2026-02-02)


### Bug Fixes

* **docker:** change tags of the published images ([8d95229](https://github.com/Carmentis/carmentis-operator/commit/8d95229b04338897d15439e542da881fa9e233e3))

## [1.2.1](https://github.com/Carmentis/carmentis-operator/compare/v1.2.0...v1.2.1) (2026-01-29)


### Bug Fixes

* packages audit and upgrades ([faaa87c](https://github.com/Carmentis/carmentis-operator/commit/faaa87c4f26f396d442710b25da9be6f25d58f11))

# [1.2.0](https://github.com/Carmentis/carmentis-operator/compare/v1.1.3...v1.2.0) (2026-01-22)


### Bug Fixes

* **sdk:** addition of the SDK ([e12c351](https://github.com/Carmentis/carmentis-operator/commit/e12c351577354635de45fea8955f9900576c73c8))
* update hasTokenAccount logic to use nested organisation field to allow organizatino publication ([c8b61b1](https://github.com/Carmentis/carmentis-operator/commit/c8b61b1b7b4012e4f8e7dbb54feb33dd5472fc29))


### Features

* staking/unstaking ([8e7c143](https://github.com/Carmentis/carmentis-operator/commit/8e7c14398a6dd56425e1ee5b25fc48ec11e70940))

## [1.1.3](https://github.com/Carmentis/carmentis-operator/compare/v1.1.2...v1.1.3) (2026-01-11)


### Bug Fixes

* remove empty state logic from OrganisationsList component to allow orgnization creation ([a7ab3b0](https://github.com/Carmentis/carmentis-operator/commit/a7ab3b0d553c83739106cdd7b98c229b4939dd28))

## [1.1.2](https://github.com/Carmentis/carmentis-operator/compare/v1.1.1...v1.1.2) (2026-01-11)


### Bug Fixes

* no migration by default in start script ([11a56e5](https://github.com/Carmentis/carmentis-operator/commit/11a56e50c2b8532803605c3295a6282126b5fb33))

## [1.1.1](https://github.com/Carmentis/carmentis-operator/compare/v1.1.0...v1.1.1) (2026-01-11)


### Bug Fixes

* need to publish ([d195821](https://github.com/Carmentis/carmentis-operator/commit/d19582152f36b5f0d8d210c806e0e9e110f345d2))

# [1.1.0](https://github.com/Carmentis/carmentis-operator/compare/v1.0.3...v1.1.0) (2026-01-10)


### Bug Fixes

* delete the outdated challenges by batch ([abb87d7](https://github.com/Carmentis/carmentis-operator/commit/abb87d73db1b3c087ac40bd6f15235395f6bc123))
* update JWT module options with explicit typing in WorkspaceApiModule ([a59e502](https://github.com/Carmentis/carmentis-operator/commit/a59e502fa1b7aac14e1061c75fa3de6daaefb9fb))


### Features

* add OrganisationDetails, OrganisationKeys, and PageSkeleton components ([fedc968](https://github.com/Carmentis/carmentis-operator/commit/fedc968b3099d6e8169a21cbcd3db489f23e49ae))
* addition of limiter for public requests ([4077375](https://github.com/Carmentis/carmentis-operator/commit/40773752873c491dda7af31ea04a70bdc9e6631d))
* enable staking for nodes and support wallet-related operations ([da0fbdb](https://github.com/Carmentis/carmentis-operator/commit/da0fbdbdc4c649762fa6738eee69d9c8c6273958))
* enhance UI/UX with updated themes and global styles ([29e1ce0](https://github.com/Carmentis/carmentis-operator/commit/29e1ce0fe74e47ad2d91df41251674142d3c3bf3))
* improve anchoring with wallet functionality and add enhanced logging ([10b7500](https://github.com/Carmentis/carmentis-operator/commit/10b75003b5fbe95876a8359f5045906cc2168f44))
* migrations are now supported for the operator ([9994d15](https://github.com/Carmentis/carmentis-operator/commit/9994d152448c8137ed2ce525ac6e661676e41557))
* modularize workspace with reusable components for organisations and users ([be8ad22](https://github.com/Carmentis/carmentis-operator/commit/be8ad22bae3bdbe645e60712749b40117099c97f))

## [1.0.3](https://github.com/Carmentis/carmentis-operator/compare/v1.0.2...v1.0.3) (2025-10-02)


### Bug Fixes

* addition of missing packages for apollo ([406d48a](https://github.com/Carmentis/carmentis-operator/commit/406d48af3f369c56e6a8e51ccff25c4db3e3e640))
* config documentation generation ([d6b2487](https://github.com/Carmentis/carmentis-operator/commit/d6b24876cbed9a3bbf9a645a2ece38e1b7c20322))
* **sec:** update dependencies to remove flawed ones ([a397bfc](https://github.com/Carmentis/carmentis-operator/commit/a397bfc019b05ab3a2b9b25bf5db78a0e9d4f3d0))

## [1.0.2](https://github.com/Carmentis/carmentis-operator/compare/v1.0.1...v1.0.2) (2025-10-01)


### Bug Fixes

* **ci:** use token with explicit right to create a package instead of the GITUB_TOKEN token ([aeba8e5](https://github.com/Carmentis/carmentis-operator/commit/aeba8e5599fa389f88e99a61b6ca304a4e78d0e8))

## [1.0.1](https://github.com/Carmentis/carmentis-operator/compare/v1.0.0...v1.0.1) (2025-10-01)

# 1.0.0 (2025-10-01)


### Bug Fixes

* accessed the operator url via process instead of env ([c5021f9](https://github.com/Carmentis/carmentis-operator/commit/c5021f9bdf845b945896d8514991b21c0a53874f))
* accessed the operator url via process instead of env ([2ad8309](https://github.com/Carmentis/carmentis-operator/commit/2ad8309d20838388b7827668ad99c2f5bd2c57b1))
* add missing [ brackets and remove github actions. ([8b4ba8b](https://github.com/Carmentis/carmentis-operator/commit/8b4ba8bc09ddbee343136f7f1276da9e1d50372e))
* better access management for org and apps + tests ([04618a2](https://github.com/Carmentis/carmentis-operator/commit/04618a2b0f15d735b751e39f731de4a81decf16f))
* disable challenge deletion once accepted to allow authentication. WARNING: It requires attention ([a292569](https://github.com/Carmentis/carmentis-operator/commit/a2925698e337fa57abe65e564968210408063076))
* fetching publication status from node instead of possibly outdated data from the server ([389ce64](https://github.com/Carmentis/carmentis-operator/commit/389ce64a41e1cd21d9735f9ae5e3d7e7a47bd134))
* insertion and deletion of user from an organisation ([4a6dc45](https://github.com/Carmentis/carmentis-operator/commit/4a6dc45e60a5e2f1e026ad86d84a00e684e7dbe4))
* invalid jenkinsfile ([1b73e55](https://github.com/Carmentis/carmentis-operator/commit/1b73e5569d908fa0d602bff2aa7257e4b755ca53))
* making the OPERATOR_URL public and configurable during the runtime ([33411d5](https://github.com/Carmentis/carmentis-operator/commit/33411d5f741ca745153b40d837ffd8c4978b1195))
* organization creation with random private key broken due to invalid comparison ([1f2ba13](https://github.com/Carmentis/carmentis-operator/commit/1f2ba13a68eec17160d8fce22d34fe6111bed9e8))
* remove throw when claiming a node ([57ead14](https://github.com/Carmentis/carmentis-operator/commit/57ead14da52b862754d07a0d36830d10748afb56))
* split operator and workspace files ([8b60ce6](https://github.com/Carmentis/carmentis-operator/commit/8b60ce6bd89ca4ccc998aa53ef2969e751cb646a))
* transactions are now named ([7411528](https://github.com/Carmentis/carmentis-operator/commit/74115281d0c5c725f828c6999d70f76d07c86890))
* unclear notification error during application publication due to invalid return type in the application resolver ([95d37be](https://github.com/Carmentis/carmentis-operator/commit/95d37bea788bc665b261651f02834b09a3bcd1f2))
* updating SDK due to breaking changes in the API ([89446da](https://github.com/Carmentis/carmentis-operator/commit/89446da0e97b87cfcb4954083c8869cfa5622b96))
* website published ([bd1ad29](https://github.com/Carmentis/carmentis-operator/commit/bd1ad29a88cfd71044615037f6f0f226adf39aa0))


### Features

* add automatic versioning for operator ([35067e2](https://github.com/Carmentis/carmentis-operator/commit/35067e28fd662bb940782929fdaa5220b167bedf))
* add workspace ci ([9f20a17](https://github.com/Carmentis/carmentis-operator/commit/9f20a17ff405dc68bbf2bb42cc5fcf6914739dfe))
* addition of gasPrice as a parameter of the anchor requset ([f98678d](https://github.com/Carmentis/carmentis-operator/commit/f98678d00e454521247ef76c3cafd02db086da8b))
* admin edition ([d89aeae](https://github.com/Carmentis/carmentis-operator/commit/d89aeaef11355b7aaf1b9efef89e5263845d5624))
* api key edition in the application page ([115d06d](https://github.com/Carmentis/carmentis-operator/commit/115d06d1e34c7c4803ce96d45f05c3da37facbb0))
* applications are now automatically loaded from the chain when an existing organization is created ([0383555](https://github.com/Carmentis/carmentis-operator/commit/03835553e355816d46fdd923648eadd824b1fe5a))
* auto management of tag ([47b85bf](https://github.com/Carmentis/carmentis-operator/commit/47b85bf30f297a720584030cea16251f67b60bfa))
* claim of nodes ([7f6baca](https://github.com/Carmentis/carmentis-operator/commit/7f6baca311320fce6785a7611acbfb3f5305cb46))
* create an organization with a provided private key ([1ece92a](https://github.com/Carmentis/carmentis-operator/commit/1ece92ae3eb9964dc5f3288b314288cfb09b505f))
* display a screen when a token account has to be created for the organisation, preventing to perform an action without this ([061d615](https://github.com/Carmentis/carmentis-operator/commit/061d6153b60c03c58bdb79f1e21c418641423fe7))
* display of blockchain status for an organisation ([1c2325e](https://github.com/Carmentis/carmentis-operator/commit/1c2325e6caf9926923d9c1ca831aea4f4ce43a1f))
* edition of api key ([a3ed76b](https://github.com/Carmentis/carmentis-operator/commit/a3ed76bedf90d0ce1455fe288d158a2c23652066))
* force sync ([3a34373](https://github.com/Carmentis/carmentis-operator/commit/3a3437301adfd49e4f5f6916ea77a54c619393e4))
* improvement of ui for organisation page ([df6338f](https://github.com/Carmentis/carmentis-operator/commit/df6338f9c6cc393272f293b8b98f18eb14a04600))
* move Carmentis SDK to v1 ([e16065e](https://github.com/Carmentis/carmentis-operator/commit/e16065e09bd931427ae995db3879b0d55373eee5))
* moving to the new SDK and addition of organizaiton edition status ([65bb21a](https://github.com/Carmentis/carmentis-operator/commit/65bb21a3f365a5f299daf1ecadacbf2e6cb34a3b))
* moving to the new SDK version ([e3abc87](https://github.com/Carmentis/carmentis-operator/commit/e3abc87c949d5533d549790e796e27c8125243bd))
* node claiming ([c9ca577](https://github.com/Carmentis/carmentis-operator/commit/c9ca577c0149f342a9c0d1ad585d23de6745bdd9))
* node deletion and claim ([5267b58](https://github.com/Carmentis/carmentis-operator/commit/5267b58d241d7018a9654d3922a1fe9fb2827198))
* nodes management ([eea5727](https://github.com/Carmentis/carmentis-operator/commit/eea57271dcf1d2a418bd1f6dd8d16e2a656002e6))
* organization creation by private key ([b31d4f2](https://github.com/Carmentis/carmentis-operator/commit/b31d4f22bc2446032cc29d5959dbc66c446a415e))
* organization deletion ([425c27f](https://github.com/Carmentis/carmentis-operator/commit/425c27fc610ba47291e9f1e476dcadb02bca228b))
* return the public key of the organisation + keep consistentency of the organisation's avatar ([f76172b](https://github.com/Carmentis/carmentis-operator/commit/f76172b5f18bd8f9e4a07c2aafa8106820b55af9))
* search for user and better ui ([6bbf91a](https://github.com/Carmentis/carmentis-operator/commit/6bbf91a76d3d2105c04b8503b52474f9f6e37b0b))
* shortcuts ([b6fad86](https://github.com/Carmentis/carmentis-operator/commit/b6fad868a566d53eb0550c472845e9815e3916b8))
* show a message when an organisation does not have a token account ([748fa8f](https://github.com/Carmentis/carmentis-operator/commit/748fa8fd308e88717dfd28f2497bf8bb2054b3aa))
* sidebar improvement and quick access on the organisation sidebar ([3af4ce8](https://github.com/Carmentis/carmentis-operator/commit/3af4ce83af4dcd9680532fe5d5ae4fea52453d23))
* support of the new SDK ([ac1ff80](https://github.com/Carmentis/carmentis-operator/commit/ac1ff80d8ef22938725bbe1e8a4c7973edf84c5c))
* support of the new SDK and addition of endpoints to track anchor progression ([cb994f7](https://github.com/Carmentis/carmentis-operator/commit/cb994f71361f1ab44e41f9abe8aa5b80c479286f))
* synchronise the version of the used SDK ([05d664f](https://github.com/Carmentis/carmentis-operator/commit/05d664f8386088a145f7234c9b4dfb2c5142042d))
* ui improvement ([98a9bef](https://github.com/Carmentis/carmentis-operator/commit/98a9beff193fbd7fb3e7924a1f0c287af5e8ca1f))
* update of the sdk dependency ([5318464](https://github.com/Carmentis/carmentis-operator/commit/5318464eb66c02a73ed61fd6afa2ce3780b1e5fb))
* usage of SDK 1.6 ([cadbf93](https://github.com/Carmentis/carmentis-operator/commit/cadbf935e0a3c7afd9da28dab204033a998afbf7))
