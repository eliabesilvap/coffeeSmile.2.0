import { PrismaClient, PostStatus } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Livros', slug: 'livros' },
  { name: 'Teologia', slug: 'teologia' },
  { name: 'Devocional', slug: 'devocional' },
  { name: 'Café', slug: 'cafe' },
];

const posts = [
  {
    title: 'A graça que desperta: leitura guiada de Efésios',
    slug: 'a-graca-que-desperta-efesios',
    excerpt:
      'Uma resenha clara e prática de um comentário que ajuda a ler Efésios com profundidade e esperança diária.',
    content: `# A graça que desperta

## Porque este livro importa
Este comentário bíblico conduz o leitor pelo texto de Efésios com clareza, sem perder o peso pastoral. Cada capítulo termina com perguntas de aplicação e um pequeno resumo que liga a doutrina à vida quotidiana.

> A graça não é apenas uma ideia; é a força que nos reergue.

## Pontos fortes
- Linguagem acessível
- Boa estrutura temática
- Notas históricas úteis

## Onde pode melhorar
- Alguns capítulos ficam curtos demais
- Falta um índice temático

### Recomenda-se a quem
Leitores que procuram uma leitura profunda, mas prática, sobre identidade em Cristo.

**Se este artigo te ajudou, subscreve a newsletter.**`,
    coverImageUrl: '/images/cover-default.svg',
    categorySlug: 'teologia',
    author: 'Marta Soares',
    publishedAt: '2024-02-10T09:00:00.000Z',
    readingTime: 6,
    tags: ['resenha', 'efesios', 'doutrina'],
  },
  {
    title: 'O discipulado no dia-a-dia: notas de um clássico contemporâneo',
    slug: 'discipulado-no-dia-a-dia',
    excerpt:
      'Uma resenha honesta sobre um livro que liga espiritualidade, família e trabalho com passos concretos.',
    content: `# O discipulado no dia-a-dia

## Um livro que não foge à realidade
Com exemplos reais, o autor mostra como a fé se vive no trabalho, nas relações e no descanso.

## O que se destaca
- Exercícios semanais
- Capítulos curtos e objetivos
- Boa bibliografia

### Para quem é
Para quem quer hábitos espirituais sustentáveis e simples.

**Se este artigo te ajudou, subscreve a newsletter.**`,
    coverImageUrl: '/images/cover-default.svg',
    categorySlug: 'devocional',
    author: 'Rui Almeida',
    publishedAt: '2024-02-18T12:30:00.000Z',
    readingTime: 5,
    tags: ['disciplina', 'vida-crista', 'devocional'],
  },
  {
    title: 'Teologia para todos: uma introdução sem atalhos',
    slug: 'teologia-para-todos',
    excerpt:
      'Introdução sólida, com linguagem clara, que ajuda a construir fundamentos bíblicos sem simplismos.',
    content: `# Teologia para todos

## Visão geral
O livro apresenta os temas centrais da fé cristã com equilíbrio. Não evita conceitos difíceis, mas explica-os com paciência.

## O que aprendi
- A importância da história da igreja
- Como ler a Bíblia com contexto

## Leitura recomendada?
Sim, especialmente para quem está a começar.

**Se este artigo te ajudou, subscreve a newsletter.**`,
    coverImageUrl: '/images/cover-default.svg',
    categorySlug: 'teologia',
    author: 'Sofia Matos',
    publishedAt: '2024-03-02T10:15:00.000Z',
    readingTime: 7,
    tags: ['teologia', 'introducao', 'doutrina'],
  },
  {
    title: 'Salmos para o coração cansado',
    slug: 'salmos-para-o-coracao-cansado',
    excerpt:
      'Um devocional que acompanha os Salmos com reflexões diárias e linguagem poética.',
    content: `# Salmos para o coração cansado

## A força do texto bíblico
Cada entrada liga um Salmo a uma emoção concreta: medo, alegria, arrependimento e gratidão.

## Destaques
- Leituras breves
- Aplicações práticas
- Ritmo diário

**Se este artigo te ajudou, subscreve a newsletter.**`,
    coverImageUrl: '/images/cover-default.svg',
    categorySlug: 'devocional',
    author: 'Clara Nunes',
    publishedAt: '2024-03-15T08:00:00.000Z',
    readingTime: 4,
    tags: ['salmos', 'devocional', 'esperanca'],
  },
  {
    title: 'A oração que transforma: guia para grupos pequenos',
    slug: 'a-oracao-que-transforma',
    excerpt:
      'Resenha de um manual prático para grupos pequenos com sugestões semanais.',
    content: `# A oração que transforma

## Ferramentas úteis
O livro inclui planos de oração, perguntas para partilha e pequenas leituras bíblicas.

## Ponto forte
A simplicidade permite adaptar o material a vários contextos.

**Se este artigo te ajudou, subscreve a newsletter.**`,
    coverImageUrl: '/images/cover-default.svg',
    categorySlug: 'livros',
    author: 'Tiago Lopes',
    publishedAt: '2024-03-22T09:45:00.000Z',
    readingTime: 5,
    tags: ['oracao', 'grupos', 'lideranca'],
  },
  {
    title: 'O evangelho de Marcos em 30 dias',
    slug: 'marcos-em-30-dias',
    excerpt:
      'Um plano de leitura com comentários curtos que ajuda a seguir o ritmo do texto.',
    content: `# O evangelho de Marcos em 30 dias

## Ritmo diário
Cada dia inclui um trecho, um comentário e uma pergunta para reflexão.

## Vale a pena
Sim, sobretudo para quem precisa de consistência sem excesso de notas.

**Se este artigo te ajudou, subscreve a newsletter.**`,
    coverImageUrl: '/images/cover-default.svg',
    categorySlug: 'livros',
    author: 'Ines Faria',
    publishedAt: '2024-04-05T11:10:00.000Z',
    readingTime: 3,
    tags: ['evangelhos', 'plano', 'leitura'],
  },
  {
    title: 'Métodos de extração: V60, AeroPress e prensa francesa',
    slug: 'metodos-extracao-v60-aeropress-prensa',
    excerpt:
      'Comparação direta entre três métodos populares, com dicas práticas de moagem e temperatura.',
    content: `# Métodos de extração

## V60
Realça a acidez e a clareza do café. Ideal para notas cítricas.

## AeroPress
Versátil e rápida, produz um corpo médio e sabor limpo.

## Prensa francesa
Dá mais corpo e textura, perfeita para cafés achocolatados.

**Se este artigo te ajudou, subscreve a newsletter.**`,
    coverImageUrl: '/images/cover-default.svg',
    categorySlug: 'cafe',
    author: 'Bruno Dias',
    publishedAt: '2024-04-12T07:30:00.000Z',
    readingTime: 6,
    tags: ['metodos', 'extracao', 'moagem'],
  },
  {
    title: 'Origem e terroir: como o lugar muda o café',
    slug: 'origem-e-terroir-cafe',
    excerpt:
      'Uma viagem pelos factores de origem que moldam o sabor: altitude, solo e clima.',
    content: `# Origem e terroir

## Altitude
Altitudes mais elevadas geram maturação lenta e sabores mais complexos.

## Solo e clima
Minerais e precipitação influenciam a doçura e o corpo.

**Se este artigo te ajudou, subscreve a newsletter.**`,
    coverImageUrl: '/images/cover-default.svg',
    categorySlug: 'cafe',
    author: 'Carla Pinto',
    publishedAt: '2024-04-19T10:00:00.000Z',
    readingTime: 5,
    tags: ['origem', 'terroir', 'curiosidades'],
  },
  {
    title: 'Guia de moagem: encontra o ponto certo',
    slug: 'guia-de-moagem',
    excerpt:
      'Moagem fina, média ou grossa? Aprende a ajustar para cada método.',
    content: `# Guia de moagem

## Relação com o tempo
Quanto mais fina a moagem, mais rápida a extração.

## Dica prática
Ajusta um parâmetro de cada vez e prova o resultado.

**Se este artigo te ajudou, subscreve a newsletter.**`,
    coverImageUrl: '/images/cover-default.svg',
    categorySlug: 'cafe',
    author: 'Rita Gomes',
    publishedAt: '2024-04-26T14:20:00.000Z',
    readingTime: 4,
    tags: ['moagem', 'metodos', 'guia'],
  },
  {
    title: 'Café e devoção: rituais simples para a manhã',
    slug: 'cafe-e-devocao',
    excerpt:
      'Rotinas suaves que juntam leitura, silêncio e uma chávena bem preparada.',
    content: `# Café e devoção

## Um início intencional
Um ritual simples ajuda a criar espaço para reflexão.

## Sugestão
Define um tempo curto e consistente para leitura e oração.

**Se este artigo te ajudou, subscreve a newsletter.**`,
    coverImageUrl: '/images/cover-default.svg',
    categorySlug: 'devocional',
    author: 'Sara Costa',
    publishedAt: '2024-05-03T08:40:00.000Z',
    readingTime: 3,
    tags: ['rituais', 'manha', 'devocional'],
  },
  {
    title: 'Notícias do café: tendências de 2024',
    slug: 'noticias-do-cafe-2024',
    excerpt:
      'Sustentabilidade, novos blends e experiências sensoriais em foco no mundo do café.',
    content: `# Notícias do café: 2024

## Sustentabilidade
Cadeias mais curtas e transparência ganham força.

## Experiências sensoriais
Degustações guiadas e perfis aromáticos mais detalhados.

**Se este artigo te ajudou, subscreve a newsletter.**`,
    coverImageUrl: '/images/cover-default.svg',
    categorySlug: 'cafe',
    author: 'Joao Monteiro',
    publishedAt: '2024-05-11T09:10:00.000Z',
    readingTime: 5,
    tags: ['noticias', 'tendencias', 'industria'],
  },
  {
    title: 'Como escolher café em grão: guia para iniciantes',
    slug: 'como-escolher-cafe-em-grao',
    excerpt:
      'Um guia rápido para escolher origem, torra e perfil de sabor sem complicações.',
    content: `# Como escolher café em grão

## Origem e perfil
Procura notas que gostes: cítricas, achocolatadas ou florais.

## Torra
Torras claras preservam acidez; torras escuras dão mais corpo.

**Se este artigo te ajudou, subscreve a newsletter.**`,
    coverImageUrl: '/images/cover-default.svg',
    categorySlug: 'cafe',
    author: 'Leonor Martins',
    publishedAt: '2024-05-20T13:00:00.000Z',
    readingTime: 4,
    tags: ['guia', 'iniciante', 'torra'],
  },
];

async function main() {
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();

  const createdCategories = await prisma.$transaction(
    categories.map((category) => prisma.category.create({ data: category })),
  );

  const categoryMap = new Map(createdCategories.map((c) => [c.slug, c.id]));

  for (const post of posts) {
    const categoryId = categoryMap.get(post.categorySlug);

    if (!categoryId) {
      throw new Error(`Categoria nao encontrada: ${post.categorySlug}`);
    }

    await prisma.post.create({
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: post.coverImageUrl,
        author: post.author,
        publishedAt: new Date(post.publishedAt),
        readingTime: post.readingTime,
        tags: post.tags,
        status: PostStatus.published,
        categoryId,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
