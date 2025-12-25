/**
 * Test script to verify LLM generation is working
 * Loads sample data and generates a calendar
 */

const sampleData = {
  input: {
    company: {
      name: 'Slideforge',
      website: 'slideforge.ai',
      description:
        'Slideforge is an AI-powered presentation and storytelling tool that turns outlines or rough notes into polished, professional slide decks.',
      icp: 'Target Customers: Startup Operators, Consultants, Sales Teams, Educators',
    },
    personas: [
      {
        username: 'emily_econ',
        background:
          "I'm a startup operator who creates investor updates and internal strategy decks.",
        expertise: ['presentations', 'storytelling'],
        writingStyle: 'Casual, relatable, practical',
        subredditAffinities: ['r/GoogleSlides', 'r/productivity'],
      },
      {
        username: 'alex_sells',
        background:
          "I'm a consultant who produces client decks and proposals under tight deadlines.",
        expertise: ['sales', 'B2B'],
        writingStyle: 'Direct, confident, results-oriented',
        subredditAffinities: ['r/sales', 'r/PowerPoint'],
      },
    ],
    subreddits: ['r/PowerPoint', 'r/GoogleSlides', 'r/productivity'],
    keywords: [
      { id: 'K1', keyword: 'presentation tool' },
      { id: 'K2', keyword: 'slide deck generator' },
    ],
    postsPerWeek: 2,
    weekStartDate: new Date().toISOString(),
    weekNumber: 1,
  },
};

async function testLLMGeneration() {
  console.log('🧪 Testing LLM Generation with Sample Data\n');
  console.log('Company:', sampleData.input.company.name);
  console.log('Subreddits:', sampleData.input.subreddits.length);
  console.log('Keywords:', sampleData.input.keywords.length);
  console.log('\n');

  try {
    const response = await fetch(
      'http://localhost:3000/api/generate-calendar',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleData),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API Error:', response.status, error);
      return;
    }

    const data = await response.json();
    const calendar = data.calendar;

    console.log('✅ Calendar generated!\n');
    console.log('📊 Generated Content:\n');

    // Check posts
    console.log('📝 POSTS:');
    let templatePhrases = 0;
    let llmGenerated = 0;

    calendar.posts.forEach((post, index) => {
      console.log(`\nPost ${index + 1}:`);
      console.log(`  Subreddit: ${post.subreddit}`);
      console.log(`  Title: ${post.title}`);
      console.log(`  Body: ${post.body.substring(0, 150)}...`);

      // Check for template phrases (more comprehensive list)
      const titleLower = post.title.toLowerCase();
      const bodyLower = post.body.toLowerCase();

      const templatePhrasesList = [
        'just like it says in the title',
        "i'm looking for something that works well and saves time",
        'any recommendations appreciated',
        'what do you all use',
        "ideally something that's not too complicated",
        'tried a few options',
        "nothing's clicked yet",
        'what are people here actually using',
        'my team is struggling',
        'we spend way too much time',
        "it's becoming a bottleneck",
      ];

      const hasTemplatePhrase = templatePhrasesList.some(
        (phrase) => titleLower.includes(phrase) || bodyLower.includes(phrase)
      );

      if (hasTemplatePhrase) {
        console.log(
          `  ⚠️  Template phrase detected: "${templatePhrasesList.find(
            (p) =>
              titleLower.includes(p.toLowerCase()) ||
              bodyLower.includes(p.toLowerCase())
          )}"`
        );
        templatePhrases++;
      } else {
        console.log(`  ✅ Looks original/LLM-generated`);
        llmGenerated++;
      }
    });

    // Check comments
    console.log('\n\n💬 COMMENTS:');
    calendar.comments.forEach((comment, index) => {
      console.log(`\nComment ${index + 1}:`);
      console.log(`  Username: ${comment.username}`);
      console.log(`  Text: ${comment.commentText}`);

      const commentLower = comment.commentText.toLowerCase();
      const templateCommentPhrases = ['+1', 'seconding', 'same,'];

      const hasTemplatePhrase = templateCommentPhrases.some((phrase) =>
        commentLower.includes(phrase.toLowerCase())
      );

      if (hasTemplatePhrase && comment.mentionsProduct) {
        console.log(`  ⚠️  Generic agreement phrase`);
        templatePhrases++;
      } else {
        console.log(`  ✅ Looks original`);
        llmGenerated++;
      }
    });

    // Summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log(
      `Total items checked: ${calendar.posts.length + calendar.comments.length}`
    );
    console.log(`Template-like phrases: ${templatePhrases}`);
    console.log(`Original/LLM-generated: ${llmGenerated}`);

    if (templatePhrases === 0 && llmGenerated > 0) {
      console.log('✅ SUCCESS: LLM is generating original content!');
    } else if (templatePhrases > 0) {
      console.log(
        '⚠️  WARNING: Some template phrases detected - LLM may not be working'
      );
    }
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('\n💡 Make sure the dev server is running:');
    console.error('   npm run dev');
    process.exit(1);
  }
}

// Run the test
testLLMGeneration();
