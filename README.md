# Gastos da Casa

Controle de gastos domésticos em família: calendário de lançamentos, dashboards,
categorias personalizadas e leitura automática de notas fiscais (QR Code da
NFC-e, com OCR como reforço). Feito com Next.js 16 (App Router) + Supabase +
Drizzle ORM, funcionando como PWA instalável no celular.

## 1. Pré-requisitos

- Node.js 20+ (já instalado nesta máquina)
- Uma conta gratuita em [supabase.com](https://supabase.com)

## 2. Criar o projeto no Supabase

1. Crie um novo projeto em [supabase.com/dashboard](https://supabase.com/dashboard).
2. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.
3. Em **Project Settings → Database → Connection string**, copie a URI do modo
   **Transaction** (porta 6543) — ela já vem com usuário e host prontos, só
   falta a senha do banco que você definiu ao criar o projeto.

## 3. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha os três valores:

```bash
cp .env.example .env.local
```

## 4. Instalar dependências e criar as tabelas

```bash
npm install
npm run db:generate   # gera a migration a partir de src/lib/db/schema.ts
npm run db:migrate    # aplica no banco do Supabase
```

Depois, abra o **SQL Editor** do Supabase e rode o conteúdo de
[`supabase/sql/01_setup.sql`](supabase/sql/01_setup.sql). Esse script:

- cria um gatilho que gera automaticamente um perfil (`profiles`) quando
  alguém se cadastra;
- ativa Row-Level Security nas tabelas e cria o bucket de Storage `receipts`
  para as fotos das notas fiscais.

**Importante sobre segurança:** a aplicação acessa o Postgres via Drizzle
usando a connection string direta (usuário `postgres`), que é dona das
tabelas — por padrão o Postgres não aplica RLS ao dono das tabelas. Ou seja,
a barreira que garante que uma casa não veja dados de outra é, na prática, o
filtro por `household_id` aplicado em toda query/server action (veja
`src/lib/auth/household.ts`), não o RLS em si. O RLS habilitado no script
continua valendo como camada extra e é o que realmente protege o **Storage**
das fotos de notas (o upload é feito pelo navegador com a sessão do usuário,
então passa pelas policies de verdade). Se no futuro você quiser que o RLS
também seja a barreira principal nas tabelas, é possível trocar a conexão do
Drizzle por um papel de banco sem `BYPASSRLS` e propagar o id do usuário via
`set_config` a cada request — não implementado aqui por simplicidade.

## 5. Rodar localmente

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000), crie uma conta, crie sua
"casa" e comece a lançar receitas/despesas pelo calendário.

## 6. Convidar outros moradores

Em **Configurações → Moradores**, um administrador pode gerar um link de
convite por e-mail. Não há envio automático de e-mail configurado — copie o
link gerado e envie manualmente (WhatsApp, e-mail, etc.) para quem você quer
convidar. A pessoa precisa se cadastrar com o mesmo e-mail para o qual o
convite foi gerado.

## 7. Leitura de notas fiscais — como funciona e suas limitações

Ao clicar em **Escanear nota** (na página Calendário):

1. O app tenta ler um **QR Code** na imagem. A maioria das NFC-e brasileiras
   tem um QR Code que aponta para o portal da SEFAZ do estado emissor.
2. Se achar, o servidor busca essa página e tenta extrair valor total, data e
   nome do estabelecimento com um parser genérico (`src/lib/receipts/sefaz/parsers/generic.ts`).
   Cada estado tem um HTML diferente, então essa extração é "melhor esforço" —
   sempre revise os campos antes de confirmar.
3. Se não achar QR Code (nota antiga, foto cortada, print de tela), o app roda
   **OCR local** (Tesseract.js, direto no navegador, sem custo) e tenta achar
   o maior valor em R$ e uma data no texto reconhecido.
4. Em ambos os casos, você sempre revisa e confirma os dados antes de salvar —
   nada é lançado automaticamente sem confirmação.

Isso é intencionalmente uma primeira versão: cobertura de parsers específicos
por estado, extração de itens individuais da nota e correção de imagem (HEIC
do iPhone, deskew) ficam como evolução futura.

## 8. Deploy

Recomendado: [Vercel](https://vercel.com/new). Importe o repositório, adicione
as três variáveis de ambiente do `.env.local` nas configurações do projeto na
Vercel, e o deploy funciona sem configuração adicional (o `next.config.ts` já
inclui o plugin de PWA).

## Estrutura do projeto

```
src/
  app/
    (auth)/login, signup, convite/[token]
    (onboarding)/onboarding
    (app)/calendario, dashboards, categorias, configuracoes
    api/receipts/parse-qr
  components/  ui (shadcn) + calendar, dashboard, categories, settings, receipts
  lib/
    db/            schema Drizzle + queries
    supabase/      clientes browser/server + sessão (proxy)
    receipts/      QR, OCR, parsers da SEFAZ
    validation/    schemas zod
  proxy.ts          equivalente ao "middleware" no Next.js 16 (renomeado)
supabase/sql/       script de RLS + trigger de perfil, rodar manualmente
drizzle/migrations/ geradas por `npm run db:generate`
```
