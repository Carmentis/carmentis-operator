import typeorm from "typeorm";

export class DatabaseInit1762338647008 implements typeorm.MigrationInterface {
    name = 'DatabaseInit1762338647008'

    public async up(queryRunner: typeorm.QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "api-key-usage" ("id" SERIAL NOT NULL, "ip" character varying, "usedAt" TIMESTAMP NOT NULL DEFAULT now(), "requestUrl" character varying NOT NULL, "requestMethod" character varying NOT NULL, "responseStatus" integer NOT NULL, "apiKeyId" integer, CONSTRAINT "PK_5a4bf57a4825fa8a171df485dd7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "api-key" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "uid" character varying NOT NULL, "key" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "activeUntil" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, "applicationId" integer, CONSTRAINT "PK_6aa260b22bc37327e007316bb77" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "application" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "version" integer NOT NULL DEFAULT 0, "logoUrl" character varying DEFAULT '', "description" text NOT NULL DEFAULT '', "website" character varying DEFAULT '', "virtualBlockchainId" character varying, "lastUpdateAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "published" boolean NOT NULL DEFAULT false, "publishedAt" TIMESTAMP, "isDraft" boolean NOT NULL DEFAULT true, "organisationId" integer, CONSTRAINT "UQ_3dc2a345413ff430b44ef55ecd9" UNIQUE ("virtualBlockchainId"), CONSTRAINT "PK_569e0c3e863ebdf5f2408ee1670" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "node" ("id" SERIAL NOT NULL, "nodeAlias" character varying NOT NULL, "includedAt" TIMESTAMP NOT NULL DEFAULT now(), "rpcEndpoint" character varying NOT NULL, "virtualBlockchainId" character varying, "organisationId" integer, CONSTRAINT "PK_8c8caf5f29d25264abe9eaf94dd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "organisation" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "logoUrl" character varying, "published" boolean NOT NULL DEFAULT false, "publishedAt" TIMESTAMP, "isDraft" boolean NOT NULL DEFAULT true, "city" character varying NOT NULL DEFAULT '', "countryCode" character varying NOT NULL DEFAULT '', "website" character varying NOT NULL DEFAULT '', "privateSignatureKey" text NOT NULL, "publicSignatureKey" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdateAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL DEFAULT '0', "virtualBlockchainId" character varying, CONSTRAINT "PK_c725ae234ef1b74cce43d2d00c1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "organisation-access-right" ("id" SERIAL NOT NULL, "editUsers" boolean NOT NULL DEFAULT false, "editApplications" boolean NOT NULL DEFAULT false, "organisationId" integer, "userPublicKey" character varying, CONSTRAINT "UQ_organisation_user" UNIQUE ("organisationId", "userPublicKey"), CONSTRAINT "PK_ee1954b9aec2ae64b1b08671dc5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("publicKey" character varying NOT NULL, "firstname" character varying NOT NULL, "lastname" character varying NOT NULL, "isAdmin" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_cb86c3c9d822da3e00a082f5878" PRIMARY KEY ("publicKey"))`);
        await queryRunner.query(`CREATE TABLE "challenges" ("challenge" character varying(255) NOT NULL, "validUntil" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3c59c2e607ccd30686e55b2c1a2" PRIMARY KEY ("challenge"))`);
        await queryRunner.query(`CREATE TABLE "anchor_request_entity" ("anchorRequestId" character varying NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "organisationId" integer NOT NULL, "virtualBlockchainId" character varying, "microBlockHash" character varying, "applicationId" integer NOT NULL, "request" json NOT NULL, "gasPriceInAtomic" integer NOT NULL, CONSTRAINT "PK_25c7ae4af91ddfa8e8b1f9fdfe0" PRIMARY KEY ("anchorRequestId"))`);
        await queryRunner.query(`ALTER TABLE "api-key-usage" ADD CONSTRAINT "FK_8bdc47217ba0a0c71742ebf51e8" FOREIGN KEY ("apiKeyId") REFERENCES "api-key"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "api-key" ADD CONSTRAINT "FK_0ca6f86659fcf8ae0712d95ba26" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_95c907fc43997218fb0d45e34b7" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "node" ADD CONSTRAINT "FK_d49215d780511ad42f8cbcd7a17" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organisation-access-right" ADD CONSTRAINT "FK_0d6d77574b8bcf5cd1ba02058c6" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organisation-access-right" ADD CONSTRAINT "FK_4a882a4eefd0690bb907a46873f" FOREIGN KEY ("userPublicKey") REFERENCES "user"("publicKey") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: typeorm.QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organisation-access-right" DROP CONSTRAINT "FK_4a882a4eefd0690bb907a46873f"`);
        await queryRunner.query(`ALTER TABLE "organisation-access-right" DROP CONSTRAINT "FK_0d6d77574b8bcf5cd1ba02058c6"`);
        await queryRunner.query(`ALTER TABLE "node" DROP CONSTRAINT "FK_d49215d780511ad42f8cbcd7a17"`);
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_95c907fc43997218fb0d45e34b7"`);
        await queryRunner.query(`ALTER TABLE "api-key" DROP CONSTRAINT "FK_0ca6f86659fcf8ae0712d95ba26"`);
        await queryRunner.query(`ALTER TABLE "api-key-usage" DROP CONSTRAINT "FK_8bdc47217ba0a0c71742ebf51e8"`);
        await queryRunner.query(`DROP TABLE "anchor_request_entity"`);
        await queryRunner.query(`DROP TABLE "challenges"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "organisation-access-right"`);
        await queryRunner.query(`DROP TABLE "organisation"`);
        await queryRunner.query(`DROP TABLE "node"`);
        await queryRunner.query(`DROP TABLE "application"`);
        await queryRunner.query(`DROP TABLE "api-key"`);
        await queryRunner.query(`DROP TABLE "api-key-usage"`);
    }

}
