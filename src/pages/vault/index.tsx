import React from 'react';
import Head from 'next/head';
import { VaultLayout } from '../../modules/vault/components/VaultLayout';

export default function VaultPage() {
  return (
    <>
      <Head>
        <title>RPGSA — Vault (Obsidian Clone)</title>
        <meta name="description" content="Editor Markdown e base de conhecimento integrada ao RPGSA com suporte a pastas locais do Windows." />
      </Head>
      <VaultLayout />
    </>
  );
}
