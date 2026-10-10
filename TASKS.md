# Task queue (top to bottom)

- [ ] 1. Rubric v2. From main, branch bus/rubric-v2. Update
      docs/pedagogy-rubric.md: mark ALL rules ACCEPTED, and add:
      - Card backs at Seedling and Sprout: name and sound only. Facts go to
        Buzz and the story.
      - Story limits: Seedling ≤3 short sentences, Sprout ≤4, Blossom ≤6, Bloom ≤8.
      - Baby animal names: just "baby" below Blossom.
      - Dog is allowed at all stages.
      - Predators that look fierce (crocodile, wolf): Blossom and Bloom only.
        No hunting or eating-prey wording for any animal.

- [ ] 2. Farm Animals fixes. git switch bus/farm-animals. Apply the rubric:
      - Quiz options: Seedling 2, Sprout 3, Blossom 3, Bloom 4.
      - Card backs: Seedling and Sprout show name and sound only.
        Blossom: a fact of 5 words or fewer (new field). Bloom: a fact of
        8 words or fewer (trim fact_b).
      - Stories within the story limits above.
      - Baby names: "baby" for Seedling and Sprout.
      - Buzz greetings: max 2 short sentences, ending on encouragement.
        Replace "Tap a chip" with simpler words at Seedling.
      - getBuzzPrompt: add "Never correct the child harshly" and
        "Never ask for the child's name, school, location or any personal detail".
      - British English: "Colour", "jumpers".
      - Soften the Bull and Goose clues so nothing sounds scary.
      - Keep the dog at all stages. Keep counts 5 / 8 / 12 / 16.
      Re-run the config checks for all 4 stages. Commit, push origin bus/farm-animals.
      In NIGHT-REPORT.md list each change by stage and animal.

- [ ] 3. Trial email for no-card trials. From main, branch bus/trial-email.
      Rewrite emails/drafts/trial-ending.html: the trial is free with no card,
      so the email asks the parent to choose a plan before {{trialEndDate}} to
      keep access, with a button to the pricing page. Warm, short, British
      English. Commit, push origin bus/trial-email.

- [ ] 4. No-card checkout plan. No branch, no edits. Read api/stripe-checkout.js
      and api/webhook.js and write in NIGHT-REPORT.md exactly what must change so
      the 30-day trial starts without a card and the parent adds a card later,
      including what happens at trial end if no card is added. Report only.
