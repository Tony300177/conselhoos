# Delibera — Estado do Projeto

Este projeto materializa a experiência inicial do **Delibera**, uma plataforma para gestão colegiada, deliberações, transparência e participação social. A implementação atual prioriza a camada de produto: navegação, fluxos visuais, linguagem institucional e os pontos de integração que deverão receber dados e permissões reais.

> **Princípio de entrega:** a interface não simula integração produtiva. Os números e registros exibidos são dados demonstrativos de layout; autenticação, persistência, documentos e permissões devem ser conectados à estrutura Supabase prevista no PRD antes do uso operacional.

## O que está entregue

| Área | Entrega atual | Situação |
| --- | --- | --- |
| Portal público | Página institucional com transparência, conselhos, agenda, decisões e participação social. | Interface pronta para receber registros públicos. |
| Espaço administrativo | Navegação persistente, barra contextual e **régua cívica** de rastreabilidade em todos os módulos. | Interface navegável. |
| Painel | Indicadores, agenda, calendário de decisões, assiduidade e alertas de prazos. | Visualização demonstrativa. |
| Conselhos | Registro institucional, pesquisa, composição e estado de atualização. | Integração pendente. |
| Reuniões | Listagem de encontros, preparação, estados e ciclo operacional. | Integração pendente. |
| Documentos | Acervo, filtros, contexto, status de publicação e ação de download. | Integração com Storage pendente. |
| Relatórios | Filtros, caderno de evidências, indicadores e exportação preparada. | Queries e geração segura de PDF pendentes. |
| Demais módulos do MVP | Rotas e estados de produto para membros, mandatos, pautas, votos, atas, resoluções, encaminhamentos, auditoria e configurações. | Prontos para implementação incremental. |

## Decisões de experiência

A direção **Caderno Cívico** transforma os princípios do PRD em uma interface operacional. O administrativo usa a régua cívica para exibir base, registro e próximo ato, deixando evidentes situação, responsabilidade e continuidade do processo. Registros assumem estética de arquivo público — número, contexto, atualização e publicação — em vez de painéis genéricos.

O portal público foi construído como uma camada mais aberta e editorial. A mesma linguagem de marca liga o uso interno à prestação de contas: verde institucional, argila para marcos de atenção, superfícies marfim, tipografia editorial e imagens documentais.

## Arquitetura de integração recomendada

| Camada | Responsabilidade | Próxima ação |
| --- | --- | --- |
| React + TypeScript + Vite | Interface, rotas, formulários, consultas e estados de interface. | Trocar os dados demonstrativos por consultas tipadas. |
| Supabase Auth | Sessão, recuperação de senha e vínculo de usuário ao perfil. | Criar `profiles` e o provedor de autenticação. |
| PostgreSQL + RLS | Conselhos, membros, reuniões, votos, documentos e visibilidade. | Versionar migrations, enums, índices e policies. |
| Supabase Storage | Arquivos privados, documentos públicos, anexos e avatares. | Criar buckets e políticas de leitura/escrita. |
| Edge Functions | Geração de PDF, URLs seguras, publicação, auditoria e notificações. | Implementar operações privilegiadas sem expor `service_role`. |

## Ordem de implementação do MVP

| Etapa | Resultado verificável | Dependência principal |
| --- | --- | --- |
| 1. Fundação de dados | Migrations de organizações, perfis, conselhos e membros aplicadas. | Projeto Supabase configurado. |
| 2. Identidade e acesso | Login, recuperação de senha, papéis e RLS validados. | Auth e tabela `profiles`. |
| 3. Operação colegiada | Reunião, pauta, presença e quórum persistidos. | Conselhos e mandatos. |
| 4. Deliberação e memória | Votações, atas, resoluções e encaminhamentos rastreáveis. | Operação colegiada. |
| 5. Acervo e transparência | Documentos, portal público e consultas com visibilidade controlada. | Storage e regras de publicação. |
| 6. Evidências e governança | Relatórios, PDF, notificações e trilha de auditoria. | Dados operacionais e funções seguras. |

## Critérios para a próxima entrega técnica

O próximo incremento deve começar pelo **SQL versionado do Supabase**. Ele deve conter tabelas, relações, chaves, enums de status, índices, gatilhos de `updated_at`, políticas RLS, buckets, políticas de Storage e o mecanismo de `audit_logs`. Quando essa camada estiver aplicada, os componentes atuais poderão passar a consultar e atualizar dados reais de modo progressivo, começando por autenticação, conselhos e reuniões.

## Qualidade verificada nesta versão

A compilação TypeScript e o build de produção foram executados com sucesso. O portal público, painel, registro de conselhos, acervo, relatórios e o painel em largura móvel foram revisados visualmente. A interface responde aos links internos, filtros demonstrativos, pesquisa, seletores, navegação compacta e mensagens de ação; operações que dependem de persistência exibem orientação explícita de que requerem a conexão segura do backend.
