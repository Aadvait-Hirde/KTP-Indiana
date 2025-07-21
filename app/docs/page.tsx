"use client"

import React, { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/sections/footer"
import Image from "next/image"

const sections = [
  { id: "intro", title: "Intro" },
  { id: "constitution", title: "Constitution" },
  { id: "rush", title: "Rush" },
  { id: "pledgeship", title: "Pledgeship" },
  { id: "internal-external", title: "Internal & External Affairs" },
  { id: "marketing", title: "Marketing" },
  { id: "finance", title: "Finance" },
  { id: "operations", title: "Operations & Logistics" },
  { id: "tech-stack", title: "Website Technology Stack" },
  { id: "conclusion", title: "Conclusion" },
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("intro")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const scrollToSection = (href: string) => {
    // This is just for the main navbar functionality
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    // Auto-collapse sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true)
    }
  }

  const handleConstitutionDownload = () => {
    const link = document.createElement('a')
    link.href = '/KTP Constitution.pdf'
    link.download = 'KTP Constitution.pdf'
    link.click()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar scrollToSection={scrollToSection} />
      
      <div className="container-fluid px-0">
        <div className="flex min-h-screen">
          {/* Left Sidebar - Collapsible */}
          <div className={`${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-80'} bg-muted/50 border-r transition-all duration-300 flex-shrink-0`}>
            <div className="sticky top-16 p-6 pt-8 w-80">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Documentation</h2>
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="lg:hidden p-1 hover:bg-muted rounded"
                  aria-label="Toggle sidebar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 px-8 py-8 relative">
            {/* Mobile sidebar toggle button */}
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-md shadow-lg"
                aria-label="Open sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            <div className="max-w-4xl mx-auto space-y-12">
              {/* Intro Section */}
              <section id="intro" className="scroll-mt-24">
                <div className="space-y-6">
                  <h1 className="text-4xl font-bold tracking-tight">Intro</h1>
                  <div className="prose prose-lg max-w-none space-y-4">
                    <p className="text-justify">
                      Hey there! This documentation is a joint initiative for new colonies by KTP Indiana, Ohio State, UMich, and Virginia Tech. We&apos;re so excited to see you transition from a colony to chapter and to have you as our brothers! Here&apos;s a big set of documentation with a bunch of resources to help y&apos;all get off the ground :)
                    </p>
                    
                    <p className="text-justify">
                      Starting a chapter can feel super overwhelming at first, there&apos;s so many moving parts, and it&apos;s hard to know where to even begin. So we put all of this together to give you a clear roadmap. This isn&apos;t just a boring PDF of rules and procedures. It&apos;s a living, breathing guide which we keep updating as we learn, that covers everything from rush and pledgeship to marketing, operations, alumni, and more. It&apos;s the stuff we wish we had when we were getting started.
                    </p>
                    
                    <p className="text-justify">
                      We&apos;ve also typed each word of this ourselves, to make it more personal and &apos;curated&apos;, cuz we don&apos;t want you to feel like you&apos;re reading a big pile of AI-generated paragraphs, so feel free to steal anything you want, remix it, copy/paste whatever, the goal is to make your launch as easy and smooth as possible. If you&apos;ve got questions, need templates, or wanna hop on a call to figure things out, reach out anytime. We&apos;re all in this together, and we&apos;re hyped to see how your chapter of the story unfolds (pun intended?).
                    </p>
                  </div>
                </div>
              </section>

              {/* Constitution Section */}
              <section id="constitution" className="scroll-mt-24">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tight">Constitution</h2>
                  <div className="flex gap-6">
                    <div className="flex-1">
                      <div className="prose prose-lg max-w-none space-y-4">
                        <p className="text-justify">
                          <strong>This is essentially the foundation of your KTP chapter.</strong> Nationals provides you with a constitution for reference which is awesome, we&apos;ve taken that and tailored it based on our requirements.
                        </p>
                        
                        <p className="text-justify">
                          Writing up a solid constitution from scratch is quite a boring task, so here&apos;s our constitution which is different from nationals&apos; which we think would provide a different perspective (<strong>click on the image!</strong>). Feel free to refer to it while writing yours or copy it as is (but pls don&apos;t forget to change the names tho lol). It&apos;s mostly ChatGPTed because let&apos;s be so real, no one is reading it. <strong>But again, it does need to align with exactly what you&apos;re looking for as a fraternity </strong> at your campus so it doesn&apos;t bite you in the ass when you&apos;re trying to make decisions. So try to <strong>make sure that the clauses and articles are in line with your policies.</strong>
                        </p>
                        
                        <p className="text-justify">
                          Another thing, please check that your fraternity governing body at your university doesn&apos;t have any additional articles that need to be added. Generally they ask you to include a Personal Gain Clause, an Anti-Hazing Policy, and a Statement of University Compliance, but not necessarily. Some also require a non-discrimination clause or a clause saying your constitution overrides any informal norms. Once that&apos;s done you&apos;re good to go!
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div 
                        className="cursor-pointer transition-transform hover:scale-105"
                        onClick={handleConstitutionDownload}
                      >
                        <Image
                          src="/docs-section/constitution/constitution-image.png"
                          alt="KTP Constitution"
                          width={250}
                          height={180}
                          className="border"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Rush Section */}
              <section id="rush" className="scroll-mt-24">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tight">Rush</h2>
                  <div className="prose prose-lg max-w-none space-y-6">
                    <p className="text-justify">
                      Oh rush is AMAZING. It&apos;s incredibly tiring, I&apos;ll be honest, but it&apos;s also when you get to meet new people and talk about interesting things for two weeks straight. <strong>The general timeline usually looks like this: Open Rush → Applications → Delibs 1 → Closed Rush → Delibs 2 → Bids</strong>
                    </p>
                    
                    {/* Open Rush */}
                    <div className="space-y-4">
                      <div className="flex gap-6">
                        <div className="flex-1 space-y-4">
                          <p className="text-justify">
                            <strong>Open Rush:</strong> It&apos;s pretty simple, <strong>pick a theme.</strong> We did F1 last semester, and we&apos;re doing Just Dance this upcoming one. Other chapters have done Retro Mac, Mario Kart, PGA Tour, etc. Once that&apos;s locked in, market it like crazy, get your rooms booked, and choose the format you want to go with. You could do coffee chats, or a round-table format where 3–4 rushees talk to 1–2 actives for 6 minutes then rotate.
                          </p>
                          
                          <p className="text-justify">
                            Open rush is usually 4 days, so <strong>plan something unique each day.</strong> Feel free to go nuts, some frats have rushees make Canva slides to present themselves, others run Shark Tank comps, 45-minute case comps, game nights, or whatever else sounds fun.
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Image
                            src="/docs-section/rush/open-rush.jpeg"
                            alt="Open Rush Event"
                            width={280}
                            height={200}
                            className="border"
                          />
                        </div>
                      </div>
                      
                      <p className="text-justify">
                        Whatever you do, just <strong>make sure it&apos;s fun and you&apos;re actually getting to know people. Pay attention to how they talk, what they&apos;re into and how they act in groups.</strong> The little stuff matters. Mental notes don&apos;t work when you&apos;ve got 200+ people, so feel free to use tracking numbers, name tags, photos, anything that helps you remember who&apos;s who.
                      </p>
                    </div>

                    {/* Application */}
                    <div className="space-y-4">
                      <p className="text-justify">
                        <strong>Application:</strong> Once open rush wraps up, the application goes out. We started without video responses, but we&apos;re adding them this semester. You can use whatever platform works for you, we use <strong>Airtable + Zapier</strong> to automate most of it. The Zapier part is a little complicated, so if you&apos;re trying to set that up, shoot us an email and we&apos;ll help you out.
                      </p>
                      
                      <p className="text-justify">
                        If Airtable feels like too much, Google Forms + Sheets or Microsoft Forms + Excel also work just fine. Another reason we recommend Airtable is because you can reuse the same base for committees, position apps, etc. and turn table schemas directly into forms, which makes your life way easier.
                      </p>
                      
                      <div className="mt-6">
                        <Image
                          src="/docs-section/rush/airtable.png"
                          alt="Airtable Application System"
                          width={800}
                          height={500}
                          className="border w-full"
                        />
                      </div>
                    </div>

                    {/* Combined Deliberations and Closed Rush/Bids */}
                    <div className="space-y-6">
                      <p className="text-justify">
                        <strong>Deliberations (1st Round):</strong> This night&apos;s always a lot. Get your bid review committee or all the actives in a room (don&apos;t forget to book it in advance), and go through each app. You can <strong>create your own scoring system or use Nationals&apos; rubric.</strong> Review holistically, you can even anonymize resumes and apps if you want, score them, then deanonymize after. We usually pick 35–45 people for closed rush, but it totally depends on your applicant pool.
                      </p>

                      <div className="flex gap-6">
                        <div className="flex-1 space-y-4">
                          <p className="text-justify">
                            <strong>Closed Rush:</strong> Congrats, you&apos;ve selected the top people for closed rush! This is when you really get to know people and put them under some pressure (but in a good way). We did dinners with actives around Bloomington and ran interviews after. Usually there are 2–3 events. Feel free to grill them a little (or a LOT) and <strong>ask interesting, hard-hitting questions.</strong> Take solid notes on each person&apos;s performance, so you&apos;re ready for final delibs.
                          </p>
                          
                          <p className="text-justify">
                            <strong>Deliberations (2nd Round) + Bids Distribution:</strong> Time to wrap it all up. Final delibs are where you decide who&apos;s getting bids based on everything you&apos;ve seen. Make your decisions based on their applications, open and closed rush performance, interviews, vibe checks, the works. You can do this with the bid committee or with all the actives again.
                          </p>
                          
                          <p className="text-justify">
                            Once your final list&apos;s ready, <strong>GET CREATIVE with how you give out bids.</strong> We made rushees take a fake &quot;final exam.&quot; You could prank call them, make a scavenger hunt, dunk their head in a fountain or something, do whatever fits your chapter vibe.
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Image
                            src="/docs-section/rush/bids.jpeg"
                            alt="Bids Distribution"
                            width={200}
                            height={150}
                            className="border"
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-justify">
                      And that&apos;s a wrap on rush! Exhausting? Yes. Worth it? Absolutely :)
                    </p>
                  </div>
                </div>
              </section>

              {/* Pledgeship Section */}
              <section id="pledgeship" className="scroll-mt-24">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tight">Pledgeship</h2>
                  <div className="prose prose-lg max-w-none space-y-6">
                    <p className="text-justify">
                      Now that you&apos;ve handed out bids, it&apos;s time to build the next generation of your chapter. <strong>What you need to figure out first is what educational structure you want the pledgeship to follow.</strong> Our focus is more entrepreneurship + tech, yours could be finance + tech or law + tech or any combination you like. Once you&apos;ve decided that, <strong>frame your curriculum around that.</strong> The main goal of pledgeship is to be rigorous, and make it so that pledges form strong bonds.
                    </p>

                    {/* Pins section with two-column layout */}
                    <div className="flex gap-6 items-center">
                      <div className="flex-1">
                        <p className="text-justify">
                          We use Google Classroom, but we&apos;ll be using Canvas through an administrator account for next semester&apos;s pledgeship. Both have their pros and cons, Classroom&apos;s pretty convenient with access directly through Gmail, while Canvas allows pledges to see their school and KTP coursework on the same page. In terms of assignments, try to have a mix of both solo and group projects that cover all bases. Make sure they&apos;re wearing their pins to events too. The official pins are ninjas, but we think they look quite garbage in our humble, honest opinion, so we designed these!
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Image
                          src="/docs-section/pledgeship/pins.jpeg"
                          alt="Custom KTP Pins"
                          width={300}
                          height={225}
                          className="border"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-justify">
                        Our flow is basically, <strong>Mondays are for technical development.</strong> We teach machine learning, full stack web development, cloud computing, cybersecurity, app development etc. <strong>Tuesdays are for entrepreneurial business development.</strong> We run YC-style pitches, Shark Tanks, case comps, and do workshops for ODF, Z Fellows, SPC and other accelerators and incubators. <strong>Fridays are for professional development.</strong> We help with big-tech internship applications, resume reviews, interview preparation, LinkedIn networking, cold emailing and all that money making stuff.
                      </p>
                      
                      <div className="mt-6">
                        <Image
                          src="/docs-section/pledgeship/pledgeship.png"
                          alt="Pledgeship Curriculum"
                          width={600}
                          height={400}
                          className="border"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-justify">
                        This is also the time to <strong>get your littles!</strong> Set up a preference form and based on matches, assign the littles. Organize a ceremony, get your littles gifts, go out for dinner, have fun! If you wanna have a lineage system, you can definitely set that up too.
                      </p>
                      
                      <div className="mt-6">
                        <Image
                          src="/docs-section/pledgeship/big-little.png"
                          alt="Big Little Ceremony"
                          width={500}
                          height={350}
                          className="border"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-justify">
                        And finally, evaluating a pledge&apos;s overall performance. <strong>Come up with a grading system</strong> that covers assignment quality, discipline, overall interactivity, etc. Set a benchmark for passing, if there&apos;s slight fluctuations it isn&apos;t a big deal, but if someone was VERY uninvolved, you can drop them.
                      </p>

                      <p className="text-justify">
                        Once pledgeship&apos;s done, it&apos;s time for <strong>INITIATION!!!</strong> We gave out certificates and roses, other chapters give different things. Have everyone suit up, click some great photos, make everyone swear an oath pledging their allegiance to KTP for fun, and hand out the certificates and roses. <strong>Your pledges are now officially actives :)</strong>
                      </p>
                      
                      <div className="mt-6">
                        <Image
                          src="/docs-section/pledgeship/initiation.jpeg"
                          alt="Initiation Ceremony"
                          width={600}
                          height={400}
                          className="border"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Internal & External Affairs Section */}
              <section id="internal-external" className="scroll-mt-24">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tight">Internal & External Affairs</h2>
                  <div className="flex gap-6">
                    <div className="flex-1">
                      <div className="prose prose-lg max-w-none space-y-6">
                        <p className="text-justify">
                          This is fairly straightforward but pretty important in terms of ensuring discipline. The VP of Internal Affairs and the people who report to them are in charge of <strong>tracking attendance, resolving conflicts, sending weekly newsletters, managing communication, etc.</strong>
                        </p>

                        <p className="text-justify">
                          Disciplinary procedures in terms of misconduct are outlined in the constitution, so make sure those are solid and up to date. The internal team should also make sure actives are showing up, putting in work, and generally not ghosting.
                        </p>

                        <p className="text-justify">
                          The External Affairs department handles <strong>corporate outreach like cold emailing companies, networking with people, and bringing in corporate sponsors.</strong> Here&apos;s an example of a cold email you can use. Play around with the format and content (we did not close Apple but hey, it doesn&apos;t hurt to try lol). You can also download our sponsorship packet from the home page. They&apos;re also in charge of <strong>partnerships with the university, on-campus clubs, and maintaining relations with the alumni of our chapter as well as other chapters.</strong> Long-term, this is one of the most important roles in the frat, so make sure the people running it are on top of it.
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Image
                        src="/docs-section/internal-external/cold-email.png"
                        alt="Cold Email Example"
                        width={300}
                        height={400}
                        className="border"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Marketing Section */}
              <section id="marketing" className="scroll-mt-24">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tight">Marketing</h2>
                  <div className="prose prose-lg max-w-none space-y-6">
                    <p className="text-justify">
                      Marketing has to be one of THE MOST IMPORTANT PARTS OF YOUR FRAT. If you can&apos;t get the word out that you exist, you will not have applicants and you will not have people. Keep in mind that as a new colony or chapter, promoting yourself well doesn&apos;t just promote you, it also <strong>makes people subconsciously compare KTP to other frats on campus.</strong> And that&apos;s exactly what you want. You want people saying, &quot;that reel KTP posted is lowk so tuff ngl, imma rush&quot; in their GCs. I know it sounds cringe, but it works.
                    </p>

                    <p className="text-justify">
                      In our case, the marketing team covers a host of things. They <strong>manage posts for Instagram and LinkedIn, design flyers, posters, and banners, come up with fun ideas for tabling or games at carnivals, and handle cold emails to professors.</strong> They also write blurbs for the Kelley Insiders newsletter, make TV screen ads for Hodge Hall, and create posts for the events calendar.
                    </p>

                    <p className="text-justify">
                      You can <strong>blast out emails to professors</strong> asking them to share your rush with a tagline like &quot;[Your University Name]&apos;s first tech-focused professional fraternity&quot;, and trust me, that gets attention. We had over 150 applicants in our very first rush. <strong>FOMO strategies and hype cycles</strong> are also a huge part of this, <strong>teasers, countdowns, flashy reels, behind-the-scenes clips,</strong> anything that makes people think &quot;holy shit I can&apos;t miss this.&quot;
                    </p>

                    <p className="text-justify">
                      They&apos;re also in charge of <strong>photography and videography</strong> at events, <strong>editing recap videos, handling reels, and managing your aesthetic as a brand.</strong> If you&apos;ve got people who are good at design or content, this is where they shine. Having a cohesive visual identity makes you feel 10x more legit, even if you&apos;re just getting started.
                    </p>

                    <p className="text-justify">
                      Make sure your socials don&apos;t just post flyers, they should <strong>tell a story.</strong> Highlight actives, post snippets from events, show off your culture. Create templates, use Canva or Figma, batch schedule things out. Finally, <strong>get the merch designs ready.</strong> Set up a committee to design and order the merch, so y&apos;all can look great. We used customink.com, but feel free to use whichever vendor suits your needs best.
                    </p>

                    <div className="space-y-4">
                      <p className="text-justify">
                        Overall, just get the marketing right, and you&apos;re SET. You&apos;ll have people applying just from seeing one good post.
                      </p>
                      
                      <div className="mt-6">
                        <div className="flex justify-between">
                          <Image
                            src="/docs-section/marketing/rush-post.png"
                            alt="Rush Social Media Post"
                            width={250}
                            height={330}
                            className="border flex-1"
                          />
                          <Image
                            src="/docs-section/marketing/rush-flyer.png"
                            alt="Rush Flyer Design"
                            width={250}
                            height={330}
                            className="border object-cover flex-1 ml-2"
                          />
                          <Image
                            src="/docs-section/marketing/merch.png"
                            alt="KTP Merchandise"
                            width={250}
                            height={330}
                            className="border object-cover flex-1 ml-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Finance & Budgeting Section */}
              <section id="finance" className="scroll-mt-24">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tight">Finance</h2>
                  <div className="prose prose-lg max-w-none space-y-6">
                    <p className="text-justify">
                      This section is quite long so be prepared. We charge <strong>$100 for actives and $150 for new members.</strong> This covers a lot of things like merch, pins, events, food, and subscriptions for tools like Canva, Supabase, Notion, etc.
                    </p>

                    <p className="text-justify">
                      Now most frats do this their own way, some use Stripe, some use Venmo or Zelle, but I genuinely believe we do it best because the platform we use just works so incredibly smoothly. We use <strong>bankingcrowded.com</strong>, and it&apos;s been flawless.
                    </p>

                    <p className="text-justify">
                      Before you can set up a bank account for your chapter, you need an EIN and to understand how nonprofit status works. So here&apos;s the breakdown, as simple as I can make it:
                    </p>

                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold">Step 1: Get an EIN</h3>
                      
                      <p className="text-justify">
                        You need this to open a bank account. <strong>Use the official IRS link:</strong>
                      </p>
                      
                      <p className="text-justify">
                        https://www.irs.gov/businesses/small-businesses-self-employed/get-an-employer-identification-number
                      </p>
                      
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
                        <p className="text-justify font-semibold text-red-800 flex items-center">
                          ⚠️ WARNING: There are a LOT of scam websites that ask you for your SSN. DO NOT fall for that. Be careful.
                        </p>
                      </div>
                      
                      <p className="text-justify">
                        Filling this out takes about 15 minutes. Here&apos;s the flow:
                      </p>

                      <div className="space-y-4">
                        <div>
                          <Image
                            src="/docs-section/finance/ein-step-1.png"
                            alt="EIN Step 1"
                            width={600}
                            height={400}
                            className="border"
                          />
                          <p className="text-justify mt-2">Select the last option: &quot;View additional types...&quot;</p>
                        </div>

                        <div>
                          <Image
                            src="/docs-section/finance/ein-step-2.png"
                            alt="EIN Step 2"
                            width={600}
                            height={400}
                            className="border"
                          />
                          <p className="text-justify mt-2">Then again, select the last option: &quot;Other nonprofit/tax-exempt organizations&quot;</p>
                        </div>

                        <div>
                          <Image
                            src="/docs-section/finance/ein-step-3.png"
                            alt="EIN Step 3"
                            width={600}
                            height={400}
                            className="border"
                          />
                          <p className="text-justify mt-2">Then choose &quot;Banking purposes&quot;</p>
                        </div>

                        <div>
                          <Image
                            src="/docs-section/finance/ein-step-4.png"
                            alt="EIN Step 4"
                            width={600}
                            height={400}
                            className="border"
                          />
                          <p className="text-justify mt-2">You or your VP of Finance can fill this out</p>
                        </div>

                        <div>
                          <Image
                            src="/docs-section/finance/ein-step-5.png"
                            alt="EIN Step 5"
                            width={600}
                            height={400}
                            className="border"
                          />
                          <p className="text-justify mt-2">Submit the form and follow the instructions, it&apos;s very straightforward</p>
                        </div>

                        <div>
                          <Image
                            src="/docs-section/finance/ein-step-6.png"
                            alt="EIN Step 6"
                            width={600}
                            height={400}
                            className="border"
                          />
                          <p className="text-justify mt-2">You&apos;ll receive your EIN instantly or within a few hours.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Step 2: Set up your bank account on BankingCrowded</h3>
                      
                      <p className="text-justify">
                        Once you have the EIN, go to bankingcrowded.com. It&apos;s a <strong>banking platform built specifically for clubs, frats, and student orgs.</strong> You can use it to <strong>collect dues, issue expense cards, track funds, and even file your tax forms (990-N)</strong>, all from one dashboard. It&apos;s super clean and super efficient.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Quick Nonprofit Explainer</h3>
                      
                      <p className="text-justify">
                        Speaking of form 990N, lemme explain the non-profit status before I get into this form. There are various types of non-profits. What we care about is that essentially Uncle Sam doesn&apos;t take his cut from our dues. <strong>Our fraternity&apos;s chapter falls under section 501(c)7, which is legally a non-profit that&apos;s tax-exempt as a social organization that receives 65% or more of its operational funds through member dues.</strong> Fairly simple.
                      </p>
                      
                      <p className="text-justify">
                        Now we are technically a 501(c)7 non-profit and function exactly like one, but we legally don&apos;t have this status. So <strong>how do you get this 501(c)7 status?</strong> Well, there&apos;s two ways. One is to file Form 1024, which costs $600 and takes 6–12 months to get certified. Absolutely not. That&apos;s disgusting. NO ONE is wasting 600 precious bucks.
                      </p>
                      
                      <p className="text-justify">
                        So what we do instead is, we <strong>&quot;self-declare&quot; exempt status</strong> by basically acting like a 501(c)7 non-profit, and simply <strong>filing form 990-N at the end of the tax year</strong> to prove that &quot;oh we filled all the criteria for being a non-profit this year, and this form proves that we receive 65% or more of our funding from member dues. So we&apos;re tax-exempt for the past year, thank you.&quot;
                      </p>
                      
                      <p className="text-justify">
                        BankingCrowded makes this very easy, because like I mentioned, the platform allows you to collect dues and file the 990-N form from the same website. And since they already keep track of all the ins and outs of your funds, you don&apos;t have to individually put in the numbers.
                      </p>
                      
                      <p className="text-justify">
                        Moreover, you can issue expense cards with limits for each department, so you could issue a card to the merch team or the marketing team or whoever.
                      </p>
                      
                      <p className="text-justify">
                        Highly recommended. Again, this is pretty complicated for the first time, so if you have any questions feel free to reach out, we&apos;d be more than happy to help! In the meantime, here&apos;s some screenshots to show how the dashboard works.
                      </p>

                      <div className="space-y-4 mt-6">
                        <Image
                          src="/docs-section/finance/crowded-dashboard.png"
                          alt="Crowded Dashboard"
                          width={700}
                          height={500}
                          className="border"
                        />
                        <Image
                          src="/docs-section/finance/crowded-collections.png"
                          alt="Crowded Collections"
                          width={700}
                          height={500}
                          className="border"
                        />
                        <Image
                          src="/docs-section/finance/crowded-form-990N.png"
                          alt="Crowded Form 990N"
                          width={700}
                          height={500}
                          className="border"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Operations & Logistics Section */}
              <section id="operations" className="scroll-mt-24">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tight">Operations & Logistics</h2>
                  <div className="prose prose-lg max-w-none space-y-6">
                    <p className="text-justify">
                      Logistics and ops! This is super important too, make sure you know how to <strong>book rooms on campus, how to request funds from the student involvement organizations at your university, how to manage inventory in terms of pins, merch, etc.</strong>
                    </p>

                    <p className="text-justify">
                      They also take care of event scheduling when guest speakers come in, handle catering, and take care of technological requirements (like projectors, mics, TV screens etc.) when hosting things.
                    </p>

                    <p className="text-justify">
                      You&apos;ll also want to build out some sort of central calendar for the whole chapter, we use Google Calendar and sync it to our website homepage and portal. Try to plan all events at least 3 weeks in advance, and make sure you&apos;re not overlapping with other major org events on campus (especially during rush).
                    </p>

                    <p className="text-justify">
                      It&apos;s also super helpful to create a master checklist for each type of event you run, that way whoever&apos;s planning the next one doesn&apos;t have to start from scratch. We&apos;ve got checklists for rush events, speaker nights, demo day, even initiation.
                    </p>

                    <p className="text-justify">
                      In our case, we&apos;re planning on bringing guest speakers from Google and Pfizer on campus to host workshops on seminars, so the logistics team will also handle their flights and comfortable stay in Bloomington.
                    </p>

                    <p className="text-justify">
                      Overall, <strong>the logistics and ops team is in charge of making sure everything runs as smoothly as possible! From room bookings to food to tech (getting mics, projectors set up etc.) to timelines,</strong> they&apos;re the ones who keep the whole thing from falling apart.
                    </p>
                  </div>
                </div>
              </section>

              {/* Website Technology Stack Section */}
              <section id="tech-stack" className="scroll-mt-24">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tight">Website Technology Stack</h2>
                  <div className="prose prose-lg max-w-none space-y-6">
                    <p className="text-justify">
                      Our chapter&apos;s website is awesome. We&apos;ve got a member portal to <strong>buy merch from, pay dues through, and see the KTP calendar with assignments.</strong> It&apos;s also got an <strong>internship board</strong> with application links that update daily, and an <strong>announcements section</strong> for the exec board.
                    </p>

                    <p className="text-justify">
                      <strong>You can definitely use our code.</strong> It&apos;s open source and in my repository. Feel free to clone it (don&apos;t open a pull request), and replace our info and photos with yours. Set up Supabase, Clerk, and Vercel accounts, and add your API keys to the .env file (DO NOT COMMIT THE .ENV FILE TO GITHUB). If you need help setting it up, reach out and I&apos;ll help out:
                    </p>

                    <p className="text-justify font-mono bg-gray-100 p-2 rounded">
                      https://github.com/Aadvait-Hirde/KTP-Indiana/
                    </p>

                    <p className="text-justify">
                      But if you wanna build something custom from scratch, here&apos;s my recommended stack:
                    </p>

                    <ul className="list-disc list-inside space-y-2 text-justify">
                      <li>Next.js 15+ with App Router (obviously)</li>
                      <li>Tailwind CSS + shadcn/ui (add reactbits if you want cool components out of the box)</li>
                      <li>Clerk for authentication</li>
                      <li>Supabase or Neon for Postgres database</li>
                      <li>Prisma or Drizzle as the ORM (depends on how comfy you are with SQL vs DX)</li>
                      <li>GitHub for version control</li>
                      <li>Namecheap for domain</li>
                      <li>Vercel for hosting</li>
                    </ul>

                    <div className="space-y-4">
                      <p className="text-justify">
                        If you want to take it a step further, you can even add role-based access control like we&apos;ve added, which includes public/private pages, custom dashboards for pledges vs actives vs alumni, and Stripe integration for payment collection. Super modular if you design it right. If you want help designing something more advanced like that, hit me up.
                      </p>

                      <div className="mt-6">
                        <div className="border rounded overflow-hidden">
                          <div className="flex">
                            <Image
                              src="/docs-section/tech/dashboard.png"
                              alt="Dashboard Interface"
                              width={400}
                              height={300}
                              className="flex-1 border-r border-b"
                            />
                            <Image
                              src="/docs-section/tech/announcements.png"
                              alt="Announcements Section"
                              width={400}
                              height={300}
                              className="flex-1 border-b"
                            />
                          </div>
                          <div className="flex">
                            <Image
                              src="/docs-section/tech/calendar.png"
                              alt="Calendar View"
                              width={400}
                              height={300}
                              className="flex-1 border-r border-b"
                            />
                            <Image
                              src="/docs-section/tech/dues.png"
                              alt="Dues Payment"
                              width={400}
                              height={300}
                              className="flex-1 border-b"
                            />
                          </div>
                          <div className="flex">
                            <Image
                              src="/docs-section/tech/login.png"
                              alt="Login Page"
                              width={400}
                              height={300}
                              className="flex-1 border-r"
                            />
                            <Image
                              src="/docs-section/tech/internships.png"
                              alt="Internships Board"
                              width={400}
                              height={300}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Image
                          src="/docs-section/tech/code.png"
                          alt="Code Repository"
                          width={800}
                          height={500}
                          className="border w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Conclusion Section */}
              <section id="conclusion" className="scroll-mt-24">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tight">Conclusion</h2>
                  <div className="prose prose-lg max-w-none space-y-6">
                    <p className="text-justify">
                      And that&apos;s pretty much everything. Starting and running a KTP chapter isn&apos;t easy, it&apos;s actually incredibly difficult. But it&apos;s one of the most rewarding things you&apos;ll ever do because you&apos;re building a legacy, something that can outlive your time on campus and keep growing long after you graduate.
                    </p>

                    <p className="text-justify">
                      Every chapter&apos;s gonna look a little different, and that&apos;s the whole point. Use this doc as a foundation, but make it your own. Try new things. Experiment with events. Build weird shit. Throw fun rush themes. Get cool speakers. Create a culture that people are proud to be part of.
                    </p>

                    <p className="text-justify">
                      If you ever need help, whether it&apos;s tech, ops, marketing, finance, or just anything in general, hit us up. We&apos;ve made a ton of mistakes and learnt from them already so you don&apos;t have to. You&apos;re not doing this alone, we&apos;re all rooting for you.
                    </p>

                    <p className="text-justify">
                      Good luck, and welcome to KTP :)
                    </p>

                    <p className="text-right font-semibold mt-8">
                      – Aadvait, Dhruv, Sid & Jasmine
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer scrollToSection={scrollToSection} />
    </div>
  )
} 