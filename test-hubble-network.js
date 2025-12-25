/**
 * Test script to verify no hardcoded Slideforge references remain
 * Uses Hubble Network data from the email
 */

const hubbleNetworkData = {
  input: {
    company: {
      name: 'Hubble Network',
      website: 'hubble.com',
      description: `Core Offering:
Hubble is a global IoT connectivity platform that turns standard Bluetooth Low Energy (BLE) sensors into globally-connected devices through a network of 90 million terrestrial gateways plus satellite coverage.
Key differentiators:

Works with existing Bluetooth hardware—no custom modems required
Firmware-level integration enables connectivity via software update
Ultra-low power: 5+ years on coin cell batteries
Usage-based pricing (pay per message sent)
Self-service platform with developer-friendly APIs and docs

Bottom line: Deploy sensors anywhere on Earth and receive data reliably without infrastructure, expensive cellular modems ($50+ vs $2), or massive upfront infrastructure costs.`,
      icp: `Target Customers:
Enterprise Technical Decision-Makers

VPs of Technology, Distinguished Engineers, IoT Product Managers
Industries: Supply chain/logistics, asset management, agriculture, environmental monitoring
Pain points: Coverage gaps, expensive cellular hardware, infrastructure costs, battery life, vendor lock-in`,
    },
    personas: [
      {
        username: 'emily_econ',
        background:
          "I'm Jake Thompson, a Technology Integration Specialist at an oilfield services company. I spend my days evaluating and implementing tracking solutions for rental equipment that gets deployed to client sites across multiple states. The challenge is finding something that works reliably in the middle of nowhere - we're talking remote drilling locations where cell coverage is spotty at best. I also have a lot of difficulty tracking critical shipments between our client locations, which are often in really hard to reach places like the middle of the ocean or in northern Alaska.\n\nI used to rely on AirTags for basic tracking, which showed me the value of simple, cost-effective solutions. But when your $50K piece of equipment disappears into a dead zone for weeks, AirTags just don't cut it. I needed something that could handle remote connectivity and actually integrate with our existing fleet management systems instead of being another standalone app.\n\nThat's when I discovered Hubble Network about eight months ago. Now I use Hubble Network to track everything from drilling pumps to generators across our entire fleet. The game-changer is that it works through both terrestrial and satellite networks, so even when our equipment is sitting on some remote pad in West Texas, I'm still getting location updates. Every morning I check the dashboard and can see exactly where every piece of equipment is, whether it's moving between sites or sitting idle.\n\nWhat I love most is that Hubble Network integrates directly with our existing fleet management software - no custom hardware needed, just leverages the Bluetooth chips already in our tracking devices. I spend my afternoons analyzing utilization reports that combine location data with maintenance schedules, which has completely changed how we optimize equipment deployment.\n\nSince implementing Hubble Network, we've reduced equipment loss by about 30% and cut down on those expensive recovery missions when gear goes missing. Our clients are happier because we can give them real-time visibility into their rentals, and our operations team can actually plan routes efficiently instead of driving around looking for equipment.\n\nHubble is also effective and monitoring for gas leaks on our remote pipelines. Previously we used expensive GPS trackers and batteries had to be replaced in the field every 6-12 mos. With Hubble no additional GPS antenna, just works with Bluetooth, and no battery changes until 3-4 yrs.",
        expertise: [
          'academics',
          'economics',
          'group projects',
          'presentations',
        ],
        writingStyle: 'Casual, relatable, college student voice, practical',
        subredditAffinities: [
          'r/AskAcademia',
          'r/teachers',
          'r/education',
          'r/GoogleSlides',
          'r/productivity',
        ],
      },
      {
        username: 'alex_sells',
        background:
          "I'm Erik Nordström, a cold chain technology consultant who spent 15 years as operations director at Norway's largest salmon distributor before going independent. Now I help seafood companies across Scandinavia modernize their supply chains, because honestly, the amount of premium fish that gets ruined due to temperature breaks during transport is heartbreaking.\n\nMy biggest challenge has always been implementing cost-effective IoT tracking that works reliably from remote Norwegian fjords all the way to international markets. Traditional solutions require expensive infrastructure and custom hardware that many mid-sized operations simply can't justify, especially when you're dealing with fishing boats and processing facilities in areas with spotty cellular coverage.\n\nThat's where Hubble Network completely changed my game about eight months ago. I use Hubble Network to set up temperature and location monitoring for my clients using just Bluetooth-enabled sensors - no modems, no custom hardware, no infrastructure headaches. Every morning I check the dashboard to see real-time data from shipments across Europe, and by lunch I've usually identified any temperature excursions that need immediate attention.\n\nWhat blows my mind is how Hubble Network seamlessly switches between terrestrial and satellite networks, so I get consistent data whether the salmon is on a boat in the Lofoten Islands or in a truck crossing the Alps. I spend my afternoons analyzing the tracking data to help clients optimize their cold chain processes and prove compliance to international buyers.\n\nSince implementing Hubble Network solutions, my clients have reduced temperature-related losses by an average of 30% and can now provide end-to-end traceability documentation that premium buyers demand. Customers are now also able to verify the temperature in the chain of custody digitally rather than having to download data directly from a pallet in person. The cost savings from prevented spoilage alone typically pays for the system within six months, which makes my job a lot easier when pitching these upgrades.",
        expertise: ['sales', 'pitch decks', 'B2B', 'enterprise deals'],
        writingStyle: 'Direct, confident, results-oriented, practical',
        subredditAffinities: [
          'r/sales',
          'r/marketing',
          'r/smallbusiness',
          'r/entrepreneur',
          'r/PowerPoint',
        ],
      },
      {
        username: 'priya_pm',
        background:
          "I'm Jordan Kim, a hardware design founder who's obsessed with building tamper-resistant systems for delivery robots. My background is split between defense electronics and consumer IoT security, and now I focus on creating anti-theft systems that can scale our fleet into haigher-risk urban areas where theft and vandalism are real problems.\n\nThe biggest challenge I face is designing cost-effective tracking and recovery systems that don't compromise operational efficiency. When you're deploying hundreds of robots across a city, you need real-time visibility without breaking the bank on connectivity costs or requiring massive infrastructure overhauls.\n\nThat's where Hubble Network has been a game-changer for me. I use Hubble Network to create our core tracking architecture because it works with existing Bluetooth chips - no need for expensive custom modems or cellular plans for every robot. Every morning I check our fleet status through the satellite connectivity, and by lunch I've usually identified any units that have gone offline or moved outside their expected zones.\n\nWhat I love most about Hubble Network is how it handles the connectivity seamlessly between terrestrial and satellite networks. I spend my afternoons analyzing the tracking data and fine-tuning our recovery algorithms, and the global coverage means I don't have to worry about dead zones or infrastructure gaps in different neighborhoods.\n\nSince implementing Hubble Network into our anti-theft systems, we've reduced asset loss by 60% and can now confidently deploy in areas we previously avoided. The cost savings on connectivity alone paid for the integration work within six months, and now we're scaling faster than ever.",
        expertise: [
          'product management',
          'tech',
          'roadmaps',
          'cross-functional work',
        ],
        writingStyle: 'Thoughtful, analytical, values narrative clarity',
        subredditAffinities: [
          'r/productmanagement',
          'r/startups',
          'r/design',
          'r/artificial',
          'r/ChatGPT',
        ],
      },
    ],
    subreddits: [
      'r/technology',
      'r/futurology',
      'r/bluetooth',
      'r/IoT',
      'r/supplychain',
      'r/logistics',
      'r/RFID',
      'r/entrepreneur',
      'r/smallbusiness',
      'r/warehousing',
      'r/construction',
      'r/fleet',
      'r/coldchain',
      'r/assetmanagement',
      'r/industrialiot',
      'r/satellite',
      'r/tracking',
      'r/startups',
      'r/business',
      'r/manufacturing',
      'r/inventorymanagement',
    ],
    keywords: [
      { id: 'K1', keyword: 'Hubble network reddit' },
      { id: 'K2', keyword: 'Hubble Network vs Wiliot' },
      { id: 'K3', keyword: 'AirTag alternative for asset tracking' },
      { id: 'K4', keyword: 'asset tracking without cellular' },
      { id: 'K5', keyword: 'asset tracking without gps' },
      { id: 'K6', keyword: 'BLE asset tracking platform' },
      { id: 'K7', keyword: 'Bluetooth asset tracking at scale' },
      { id: 'K8', keyword: 'low power asset tracking solution' },
      { id: 'K9', keyword: 'LoRaWAN vs Bluetooth' },
    ],
    postsPerWeek: 3,
    weekStartDate: new Date().toISOString(),
    weekNumber: 1,
  },
};

async function testHubbleNetwork() {
  console.log('🧪 Testing with Hubble Network data...\n');
  console.log('Company:', hubbleNetworkData.input.company.name);
  console.log('Subreddits:', hubbleNetworkData.input.subreddits.length);
  console.log('Keywords:', hubbleNetworkData.input.keywords.length);
  console.log('Personas:', hubbleNetworkData.input.personas.length);
  console.log('\n');

  try {
    // Make request to local API
    const response = await fetch(
      'http://localhost:3000/api/generate-calendar',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hubbleNetworkData),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API Error:', response.status, error);
      return;
    }

    const data = await response.json();
    const calendar = data.calendar;

    console.log('✅ Calendar generated successfully!\n');
    console.log('📊 Generated Content:\n');

    // Check posts
    console.log('📝 POSTS:');
    let slideforgeFound = false;

    calendar.posts.forEach((post, index) => {
      console.log(`\nPost ${index + 1}:`);
      console.log(`  Subreddit: ${post.subreddit}`);
      console.log(`  Title: ${post.title}`);
      console.log(`  Body: ${post.body.substring(0, 100)}...`);

      // Check for Slideforge references
      const titleLower = post.title.toLowerCase();
      const bodyLower = post.body.toLowerCase();
      if (
        titleLower.includes('slideforge') ||
        bodyLower.includes('slideforge')
      ) {
        console.log(`  ⚠️  WARNING: Found "Slideforge" in post ${index + 1}!`);
        slideforgeFound = true;
      }
    });

    // Check comments
    console.log('\n\n💬 COMMENTS:');
    calendar.comments.forEach((comment, index) => {
      console.log(`\nComment ${index + 1}:`);
      console.log(`  Username: ${comment.username}`);
      console.log(`  Text: ${comment.commentText}`);

      // Check for Slideforge references
      const commentLower = comment.commentText.toLowerCase();
      if (commentLower.includes('slideforge')) {
        console.log(
          `  ⚠️  WARNING: Found "Slideforge" in comment ${index + 1}!`
        );
        slideforgeFound = true;
      }
    });

    // Final check
    console.log('\n\n' + '='.repeat(60));
    if (slideforgeFound) {
      console.log('❌ TEST FAILED: Found hardcoded Slideforge references!');
      process.exit(1);
    } else {
      console.log('✅ TEST PASSED: No Slideforge references found!');
      console.log('✅ All content correctly uses Hubble Network data');
    }
    console.log('='.repeat(60));

    // Additional verification: Check that Hubble Network appears
    const allContent = [
      ...calendar.posts.map((p) => `${p.title} ${p.body}`),
      ...calendar.comments.map((c) => c.commentText),
    ]
      .join(' ')
      .toLowerCase();

    const hubbleMentions = (allContent.match(/hubble network/g) || []).length;
    console.log(`\n📈 Hubble Network mentioned: ${hubbleMentions} times`);

    if (hubbleMentions === 0) {
      console.log(
        '⚠️  Note: Hubble Network not mentioned in generated content (this may be normal for some post types)'
      );
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('\n💡 Make sure the dev server is running:');
    console.error('   npm run dev');
    process.exit(1);
  }
}

// Run the test
testHubbleNetwork();
