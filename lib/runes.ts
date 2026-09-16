// ICE WHISPERS — Rune Knowledge Base
//
// This is the single source of truth for rune meanings. The AI reading
// engine (lib/ai.ts) combines this structured data with the user's
// question — it never invents meanings on its own. Keeping this separate
// from prompts/UI means you can improve the divinatory content without
// touching app code, and swap AI providers without touching this file.

export type YesNoTendency =
  | "yes"
  | "likely_yes"
  | "possibly"
  | "uncertain"
  | "not_yet"
  | "unlikely"
  | "no";

export interface RuneReversedMeaning {
  interpretation: string;
  guidance: string;
  yesNo: YesNoTendency;
}

export interface Rune {
  id: number; // 1–24 standard Elder Futhark order, 0 = Wyrd (blank)
  name: string;
  aett: "Freyr" | "Heimdall" | "Tyr" | "Wyrd"; // the three families / Wyrd stands alone
  symbol: string; // unicode rune glyph for UI fallback
  canReverse: boolean; // Wyrd and a few symmetrical runes are never reversed
  coreMeaning: string;
  keywords: string[];
  upright: {
    interpretation: string;
    guidance: string;
    yesNo: YesNoTendency;
  };
  reversed: RuneReversedMeaning | null;
  domains: {
    love: string;
    career: string;
    money: string;
    personalDevelopment: string;
    decisions: string;
    challenges: string;
  };
}

export const RUNES: Rune[] = [
  {
    id: 1,
    name: "Fehu",
    aett: "Freyr",
    symbol: "ᚠ",
    canReverse: true,
    coreMeaning: "Wealth, earned reward, mobile resources — what you have worked for and now hold.",
    keywords: ["wealth", "reward", "abundance", "sustenance", "new start"],
    upright: {
      interpretation:
        "Fehu speaks of resources that are already in motion toward you — earned, not inherited, and not yet fixed in place. It marks a moment where effort is converting into something tangible.",
      guidance:
        "Notice what you've already built and use it rather than waiting for more. Fehu rewards the person who acts on what is currently available.",
      yesNo: "likely_yes",
    },
    reversed: {
      interpretation:
        "Reversed, Fehu warns that resources are leaking — through carelessness, a bad exchange, or holding on too tightly to something that needs to circulate. It is rarely about having nothing; it's about mismanaging what you have.",
      guidance:
        "Look for where value is quietly draining away — a habit, an agreement, or a comparison that costs more than it gives.",
      yesNo: "not_yet",
    },
    domains: {
      love: "A relationship built on real investment of time and care, or a warning that one side is giving more than the other.",
      career: "Earned recognition or payment for work already done; reversed, underpayment or being taken for granted.",
      money: "Direct, practical gain; reversed, overspending or a resource slipping through your fingers.",
      personalDevelopment: "Valuing what you've already achieved instead of chasing the next thing.",
      decisions: "Favor the option with a tangible, near-term payoff over the abstract one.",
      challenges: "A scarcity mindset, or the discomfort of having to share what you worked hard for.",
    },
  },
  {
    id: 2,
    name: "Uruz",
    aett: "Freyr",
    symbol: "ᚢ",
    canReverse: true,
    coreMeaning: "Raw strength, vitality, the wild ox — untamed power breaking through.",
    keywords: ["strength", "vitality", "endurance", "willpower", "breakthrough"],
    upright: {
      interpretation:
        "Uruz is physical and emotional force arriving at the right moment — the strength to push through resistance that would have stopped you a month ago.",
      guidance:
        "Trust your stamina here. This is not the moment for a gentle approach — it's the moment for direct, sustained effort.",
      yesNo: "yes",
    },
    reversed: {
      interpretation:
        "Reversed, Uruz shows strength misapplied — force used carelessly, stubbornness mistaken for resolve, or vitality that has been neglected until it became depletion.",
      guidance:
        "Ask whether you're pushing forward from strength or from exhaustion pretending to be strength.",
      yesNo: "unlikely",
    },
    domains: {
      love: "Passionate, physically alive connection; reversed, a relationship running on willpower rather than warmth.",
      career: "A demanding push that pays off through sheer capability; reversed, burnout risk.",
      money: "Strong earning potential through direct effort; reversed, forcing a deal that isn't ready.",
      personalDevelopment: "Building real resilience rather than performing toughness.",
      decisions: "Choose the path that requires courage over the one that requires comfort.",
      challenges: "Learning when strength needs to rest, not just when it needs to act.",
    },
  },
  {
    id: 3,
    name: "Thurisaz",
    aett: "Freyr",
    symbol: "ᚦ",
    canReverse: true,
    coreMeaning: "The thorn, the giant's gateway — conflict, a necessary jolt, or protective defense.",
    keywords: ["conflict", "disruption", "protection", "catalyst", "confrontation"],
    upright: {
      interpretation:
        "Thurisaz signals friction that has a purpose — an obstacle, confrontation, or hard truth that, uncomfortable as it is, is clearing a path that couldn't open any other way.",
      guidance:
        "Don't rush to smooth this over. Let the friction do its work before you decide anything.",
      yesNo: "possibly",
    },
    reversed: {
      interpretation:
        "Reversed, Thurisaz is danger without purpose — a conflict entered carelessly, or a defense that has become an attack. It can also mean a threat you're not yet seeing clearly.",
      guidance:
        "Slow down before reacting. What looks like decisiveness right now may actually be a reflex.",
      yesNo: "no",
    },
    domains: {
      love: "A necessary confrontation that clears the air; reversed, conflict that damages rather than clarifies.",
      career: "A hard negotiation or a rival that sharpens your position; reversed, office conflict that costs you standing.",
      money: "A costly but necessary correction; reversed, a bad deal disguised as an opportunity.",
      personalDevelopment: "Facing what you've been avoiding.",
      decisions: "The uncomfortable option is likely the honest one.",
      challenges: "Someone or something standing directly in your way, on purpose.",
    },
  },
  {
    id: 4,
    name: "Ansuz",
    aett: "Freyr",
    symbol: "ᚨ",
    canReverse: true,
    coreMeaning: "Odin's rune — communication, wisdom received from outside yourself, the message that changes things.",
    keywords: ["message", "wisdom", "communication", "insight", "guidance from others"],
    upright: {
      interpretation:
        "Ansuz points to a message, conversation, or piece of information that is about to matter more than you expect — possibly already in front of you, waiting to be understood correctly.",
      guidance:
        "Listen more carefully than usual right now. The answer may already have been said to you.",
      yesNo: "likely_yes",
    },
    reversed: {
      interpretation:
        "Reversed, Ansuz warns of miscommunication — a message misunderstood, advice given in bad faith, or your own voice being ignored when it should be heard.",
      guidance:
        "Double-check what you think you were told. Reversed Ansuz often means the misunderstanding is mutual.",
      yesNo: "uncertain",
    },
    domains: {
      love: "An honest conversation that shifts things; reversed, mixed signals or words left unsaid.",
      career: "Advice or an offer worth taking seriously; reversed, office rumor or a misleading brief.",
      money: "Good counsel about a financial decision; reversed, advice you shouldn't have trusted.",
      personalDevelopment: "A teacher, book, or insight arriving at the right time.",
      decisions: "Seek outside perspective before finalizing this.",
      challenges: "Saying the true thing when it would be easier to stay quiet.",
    },
  },
  {
    id: 5,
    name: "Raidho",
    aett: "Freyr",
    symbol: "ᚱ",
    canReverse: true,
    coreMeaning: "The journey, the ride — forward motion, travel, the right rhythm toward a destination.",
    keywords: ["journey", "movement", "progress", "rhythm", "travel"],
    upright: {
      interpretation:
        "Raidho confirms that things are moving in the right direction, even if slowly. It favors steady progress over dramatic leaps — the situation is on a path, and the path is sound.",
      guidance: "Keep moving at your own pace. This is not the moment to force a shortcut.",
      yesNo: "yes",
    },
    reversed: {
      interpretation:
        "Reversed, Raidho is a journey stalled or misdirected — delays, wrong turns, or motion that looks like progress but is actually going in circles.",
      guidance: "Check the direction before adding more speed. The problem may not be effort — it may be the route.",
      yesNo: "not_yet",
    },
    domains: {
      love: "A relationship moving toward commitment at a healthy pace; reversed, going nowhere despite effort.",
      career: "A promotion or project on track; reversed, stalled progress or a wrong career move.",
      money: "Steady, well-paced financial progress; reversed, a plan delayed by poor timing.",
      personalDevelopment: "Trusting your own timeline instead of someone else's.",
      decisions: "Choose the path that keeps you moving, even if it's slower.",
      challenges: "Impatience — wanting to arrive before the journey is done.",
    },
  },
  {
    id: 6,
    name: "Kenaz",
    aett: "Freyr",
    symbol: "ᚲ",
    canReverse: true,
    coreMeaning: "The torch, the forge — controlled fire, skill, creative and technical mastery.",
    keywords: ["skill", "creativity", "illumination", "craft", "transformation"],
    upright: {
      interpretation:
        "Kenaz is fire under control — the kind that shapes metal rather than burning down the house. It marks a moment where skill, clarity, or creative insight is enough to change the outcome.",
      guidance: "Apply what you actually know how to do. This is a moment for craft, not improvisation.",
      yesNo: "likely_yes",
    },
    reversed: {
      interpretation:
        "Reversed, Kenaz is the fire going out — a loss of clarity, creative block, or a skill that isn't being used because confidence has dimmed.",
      guidance: "Something needs rekindling, not replacing. Go back to what used to work.",
      yesNo: "uncertain",
    },
    domains: {
      love: "A spark rekindled through genuine effort; reversed, warmth that has cooled through neglect.",
      career: "Recognition for expertise; reversed, creative burnout or feeling unseen.",
      money: "Turning a skill directly into income; reversed, undervaluing your own work.",
      personalDevelopment: "A moment of real clarity about who you are becoming.",
      decisions: "Trust your competence here over anyone else's opinion.",
      challenges: "Reigniting motivation after a dry spell.",
    },
  },
  {
    id: 7,
    name: "Gebo",
    aett: "Freyr",
    symbol: "ᚷ",
    canReverse: false,
    coreMeaning: "The gift, the exchange — balanced reciprocity between two parties.",
    keywords: ["exchange", "partnership", "generosity", "balance", "gift"],
    upright: {
      interpretation:
        "Gebo describes a genuine exchange — something given and something received, in a way that holds both people. It rarely points to a one-sided outcome; it points to partnership.",
      guidance: "Notice what you're being asked to give as much as what you hope to receive. Gebo rewards balance, not sacrifice.",
      yesNo: "likely_yes",
    },
    reversed: null,
    domains: {
      love: "A relationship of genuine mutual give-and-take, or the need to restore balance where one side has been giving more.",
      career: "A partnership, collaboration, or fair deal.",
      money: "A transaction that benefits both sides — a fair price, a fair trade.",
      personalDevelopment: "Learning to receive as gracefully as you give.",
      decisions: "Favor the option that treats both parties fairly, even if it's not the most generous to you.",
      challenges: "An imbalance where one side is giving far more than the other.",
    },
  },
  {
    id: 8,
    name: "Wunjo",
    aett: "Freyr",
    symbol: "ᚹ",
    canReverse: true,
    coreMeaning: "Joy, harmony — the reward after hardship, belonging, shared celebration.",
    keywords: ["joy", "harmony", "belonging", "fulfillment", "celebration"],
    upright: {
      interpretation:
        "Wunjo is joy that has been earned — not fleeting pleasure, but the deeper satisfaction that comes after real effort. It suggests the hard part is genuinely behind you.",
      guidance: "Let yourself actually enjoy this instead of immediately looking for the next problem.",
      yesNo: "yes",
    },
    reversed: {
      interpretation:
        "Reversed, Wunjo is joy delayed or forced — celebrating too early, or a harmony that's more performance than reality.",
      guidance: "Be honest about whether this feels good or whether you're just telling yourself it should.",
      yesNo: "not_yet",
    },
    domains: {
      love: "Genuine happiness and ease together; reversed, a relationship that looks fine from the outside but isn't.",
      career: "A well-earned win; reversed, a success that doesn't feel as good as it should.",
      money: "A comfortable, stress-free financial period; reversed, forced optimism about money.",
      personalDevelopment: "Real contentment, not performed positivity.",
      decisions: "Choose what actually brings you ease, not what looks good.",
      challenges: "Trusting good news after a long stretch of difficulty.",
    },
  },
  {
    id: 9,
    name: "Hagalaz",
    aett: "Heimdall",
    symbol: "ᚺ",
    canReverse: false,
    coreMeaning: "Hail — sudden, uncontrollable disruption that ultimately clears the ground.",
    keywords: ["disruption", "sudden change", "upheaval", "reset", "uncontrollable"],
    upright: {
      interpretation:
        "Hagalaz names a disruption that isn't really within your control — something breaks or shifts suddenly, and no amount of planning would have prevented it. Its purpose only becomes clear afterward.",
      guidance: "Stop trying to manage what can't be managed. Focus on what you'll rebuild once the storm passes.",
      yesNo: "unlikely",
    },
    reversed: null,
    domains: {
      love: "A sudden shake-up — a breakup, a confession, or an external event that forces clarity.",
      career: "A layoff, reorganization, or unexpected opportunity that arrives without warning.",
      money: "An unavoidable expense or sudden financial shift.",
      personalDevelopment: "Growth forced by circumstance rather than chosen.",
      decisions: "This decision may be taken out of your hands — prepare for that instead of resisting it.",
      challenges: "Accepting that some things are simply not yours to control.",
    },
  },
  {
    id: 10,
    name: "Nauthiz",
    aett: "Heimdall",
    symbol: "ᚾ",
    canReverse: true,
    coreMeaning: "Need — necessity, constraint, the friction that forces resourcefulness.",
    keywords: ["need", "constraint", "necessity", "resilience", "restriction"],
    upright: {
      interpretation:
        "Nauthiz points to a real constraint — not enough time, money, or freedom to do this the easy way. It is uncomfortable, but it is also where genuine resourcefulness gets built.",
      guidance: "Work with the limitation instead of resenting it. It's teaching you something the easy path wouldn't.",
      yesNo: "not_yet",
    },
    reversed: {
      interpretation:
        "Reversed, Nauthiz is need ignored or denied — pretending a constraint doesn't exist, which usually makes the eventual reckoning harder.",
      guidance: "Name the constraint honestly. Avoiding it isn't making it smaller.",
      yesNo: "no",
    },
    domains: {
      love: "A relationship tested by real-world pressure — money, distance, time.",
      career: "Doing more with less; reversed, ignoring a resourcing problem until it becomes a crisis.",
      money: "A tight but survivable period; reversed, denial about a real shortfall.",
      personalDevelopment: "Resilience built through necessity, not choice.",
      decisions: "Be realistic about what you actually have available before deciding.",
      challenges: "Accepting limitation without giving up.",
    },
  },
  {
    id: 11,
    name: "Isa",
    aett: "Heimdall",
    symbol: "ᛁ",
    canReverse: false,
    coreMeaning: "Ice — stillness, a pause, things frozen exactly as they are for now.",
    keywords: ["stillness", "pause", "waiting", "stagnation", "clarity through stillness"],
    upright: {
      interpretation:
        "Isa says: nothing is moving right now, and trying to force movement will not work. This is a freeze, not a failure — a natural pause before the next stage.",
      guidance: "Stop pushing. Use this stillness to see the situation clearly instead of fighting it.",
      yesNo: "not_yet",
    },
    reversed: null,
    domains: {
      love: "A relationship in a holding pattern — not ending, not progressing.",
      career: "A hiring freeze, a stalled project, a decision on ice.",
      money: "Finances neither improving nor worsening — a plateau.",
      personalDevelopment: "Learning to be still without panicking.",
      decisions: "Wait. This is genuinely not the moment to decide.",
      challenges: "Sitting with uncertainty instead of manufacturing false progress.",
    },
  },
  {
    id: 12,
    name: "Jera",
    aett: "Heimdall",
    symbol: "ᛃ",
    canReverse: false,
    coreMeaning: "The harvest year — the natural cycle completing, reward that arrives on its own timeline.",
    keywords: ["harvest", "timing", "cycles", "patience rewarded", "natural results"],
    upright: {
      interpretation:
        "Jera confirms that what you planted is going to come in — but on nature's schedule, not yours. It's a strong, grounded yes, tied to patience rather than urgency.",
      guidance: "Keep tending what you've started. The outcome is coming; it just isn't instant.",
      yesNo: "yes",
    },
    reversed: null,
    domains: {
      love: "A relationship maturing naturally over time.",
      career: "A long-term project finally paying off.",
      money: "Gradual, compounding gain rather than a windfall.",
      personalDevelopment: "Trusting a process that takes real time.",
      decisions: "Favor the option with a longer but more certain payoff.",
      challenges: "Impatience with a timeline you don't control.",
    },
  },
  {
    id: 13,
    name: "Eihwaz",
    aett: "Heimdall",
    symbol: "ᛇ",
    canReverse: false,
    coreMeaning: "The yew tree — endurance, death and rebirth, the strength that comes from facing mortality or ending.",
    keywords: ["endurance", "transformation", "ending and renewal", "resilience", "the long view"],
    upright: {
      interpretation:
        "Eihwaz marks something difficult but survivable — an ending that clears space for renewal, or a test of endurance you are more prepared for than you feel right now.",
      guidance: "Don't look for a quick resolution. This is a rune of the long view — steady endurance, not a fast fix.",
      yesNo: "possibly",
    },
    reversed: null,
    domains: {
      love: "A relationship that has to end for something healthier to grow, or the deepening that comes after surviving a hard patch together.",
      career: "A role or project reaching a genuine end point.",
      money: "A necessary write-off that clears the way for stability.",
      personalDevelopment: "Facing an ending directly instead of dragging it out.",
      decisions: "The right choice may involve letting something go.",
      challenges: "Enduring a difficult passage without shortcuts.",
    },
  },
  {
    id: 14,
    name: "Perthro",
    aett: "Heimdall",
    symbol: "ᛈ",
    canReverse: true,
    coreMeaning: "The casting cup — fate, hidden forces, chance, what is not yet knowable.",
    keywords: ["mystery", "fate", "chance", "hidden factors", "the unknown"],
    upright: {
      interpretation:
        "Perthro admits that something here genuinely isn't decided yet — there are forces or information still hidden from view. It doesn't refuse an answer; it says the answer depends on something not yet revealed.",
      guidance: "Don't force certainty where there isn't any yet. Let the hidden piece surface before acting.",
      yesNo: "uncertain",
    },
    reversed: {
      interpretation:
        "Reversed, Perthro does not give a clear yes. It suggests that something important is still concealed — from you, or by the other person — which makes an outcome possible but genuinely unresolved in its current form. This is not a rejection; it's an unfinished picture.",
      guidance: "Look for what's being withheld, including anything you might be withholding from yourself. The answer will change once it surfaces.",
      yesNo: "uncertain",
    },
    domains: {
      love: "Unresolved feelings or unspoken information on one or both sides — the connection is possible but not yet fully formed.",
      career: "An opportunity that depends on a decision you can't see yet.",
      money: "An outcome tied to chance or information you don't have.",
      personalDevelopment: "Getting comfortable with not knowing yet.",
      decisions: "Gather more information before committing — this one isn't fully visible.",
      challenges: "Tolerating genuine uncertainty without forcing a premature answer.",
    },
  },
  {
    id: 15,
    name: "Algiz",
    aett: "Heimdall",
    symbol: "ᛉ",
    canReverse: true,
    coreMeaning: "The elk-sedge, the raised hand — protection, a boundary, a guardian instinct.",
    keywords: ["protection", "boundary", "instinct", "defense", "safety"],
    upright: {
      interpretation:
        "Algiz is a shield raised at the right moment — instinct or outside support protecting you from something you may not even fully see yet.",
      guidance: "Trust your instinct to guard yourself here. A boundary now prevents a bigger problem later.",
      yesNo: "likely_yes",
    },
    reversed: {
      interpretation:
        "Reversed, Algiz is a boundary that's failed or missing — vulnerability, a warning ignored, or protection you were counting on that isn't actually there.",
      guidance: "Don't assume you're covered. Check the boundary before relying on it.",
      yesNo: "unlikely",
    },
    domains: {
      love: "A relationship that feels safe and protective; reversed, a boundary being crossed.",
      career: "Support from a mentor or system; reversed, being exposed without backup.",
      money: "Protected savings or insurance paying off; reversed, being underinsured against risk.",
      personalDevelopment: "Learning to say no.",
      decisions: "Choose the option that protects you, even if it's less exciting.",
      challenges: "A real vulnerability that needs addressing, not ignoring.",
    },
  },
  {
    id: 16,
    name: "Sowilo",
    aett: "Heimdall",
    symbol: "ᛊ",
    canReverse: false,
    coreMeaning: "The sun — success, vital energy, wholeness, clarity that cannot be hidden.",
    keywords: ["success", "energy", "clarity", "vitality", "wholeness"],
    upright: {
      interpretation:
        "Sowilo is one of the clearest positive runes — energy, success, and clarity converging. What has felt unclear is about to become obvious, and the momentum favors you.",
      guidance: "Act with confidence. This is a moment to move forward visibly, not to hide your progress.",
      yesNo: "yes",
    },
    reversed: null,
    domains: {
      love: "Clarity and genuine warmth between two people.",
      career: "A visible win — recognition, success, momentum.",
      money: "A strong, clear financial gain.",
      personalDevelopment: "A real breakthrough in self-understanding.",
      decisions: "The path is clear — trust what you now see plainly.",
      challenges: "Sustaining momentum once the initial clarity fades.",
    },
  },
  {
    id: 17,
    name: "Tiwaz",
    aett: "Tyr",
    symbol: "ᛏ",
    canReverse: true,
    coreMeaning: "Tyr's rune — justice, sacrifice for a greater good, honorable struggle, the willingness to do the right thing even at cost.",
    keywords: ["justice", "honor", "sacrifice", "discipline", "fair fight"],
    upright: {
      interpretation:
        "Tiwaz favors the right action over the easy one, even when it costs something. It's a strong sign that discipline and honesty will win out here, even in a difficult contest.",
      guidance: "Do the right thing even if it's not the most comfortable one. This rune rewards integrity directly.",
      yesNo: "yes",
    },
    reversed: {
      interpretation:
        "Reversed, Tiwaz is a fight fought unfairly, or a sacrifice made for the wrong reason — giving up too much for someone or something that won't return the honor.",
      guidance: "Check whether your effort here is actually being met with fairness.",
      yesNo: "unlikely",
    },
    domains: {
      love: "A relationship built on mutual respect and fairness; reversed, one-sided sacrifice.",
      career: "Recognition for doing things the right way; reversed, being taken advantage of for your loyalty.",
      money: "A fair outcome after a hard-fought negotiation; reversed, an unjust deal.",
      personalDevelopment: "Standing by your principles under pressure.",
      decisions: "Choose the honest path, even if it's the harder one.",
      challenges: "A genuine test of integrity.",
    },
  },
  {
    id: 18,
    name: "Berkano",
    aett: "Tyr",
    symbol: "ᛒ",
    canReverse: true,
    coreMeaning: "The birch — new growth, motherhood, fertility, gentle beginnings that need protection.",
    keywords: ["new growth", "fertility", "nurturing", "beginnings", "renewal"],
    upright: {
      interpretation:
        "Berkano marks something newly starting — fragile, alive, and genuinely promising, but still early. It favors patience and care over speed.",
      guidance: "Protect this while it's young. Don't expose it to pressure or judgment too soon.",
      yesNo: "likely_yes",
    },
    reversed: {
      interpretation:
        "Reversed, Berkano is growth stalled or smothered — a new beginning that hasn't been given the conditions to develop, or overprotection that's preventing it from growing at all.",
      guidance: "Check whether you're nurturing this or suffocating it.",
      yesNo: "not_yet",
    },
    domains: {
      love: "A relationship in its early, tender stage; reversed, a connection being rushed or overcontrolled.",
      career: "A new project worth investing patience in; reversed, an idea started but not given room to grow.",
      money: "A new income source in its early, promising stage.",
      personalDevelopment: "Being gentle with yourself during a fresh start.",
      decisions: "Give this more time before judging it.",
      challenges: "Resisting the urge to rush something that's still forming.",
    },
  },
  {
    id: 19,
    name: "Ehwaz",
    aett: "Tyr",
    symbol: "ᛖ",
    canReverse: true,
    coreMeaning: "The horse — trust, partnership in motion, two working as one toward the same direction.",
    keywords: ["partnership", "trust", "cooperation", "progress together", "loyalty"],
    upright: {
      interpretation:
        "Ehwaz describes real, working trust between two people or parties moving in the same direction — progress that happens because you're aligned, not despite it.",
      guidance: "Lean on the partnership. This is not a moment to go it alone.",
      yesNo: "yes",
    },
    reversed: {
      interpretation:
        "Reversed, Ehwaz shows a partnership out of step — trust that hasn't been earned yet, or two people pulling in different directions while pretending to move together.",
      guidance: "Be honest about whether you're actually aligned, or just hoping you are.",
      yesNo: "uncertain",
    },
    domains: {
      love: "Genuine teamwork and trust; reversed, a couple moving in different directions.",
      career: "A strong working relationship or mentor-mentee bond; reversed, misalignment with a colleague or partner.",
      money: "A joint financial venture built on trust; reversed, a partnership with mismatched expectations.",
      personalDevelopment: "Learning who you can actually rely on.",
      decisions: "Don't decide this alone — bring in the person you trust.",
      challenges: "Rebuilding trust that has slipped.",
    },
  },
  {
    id: 20,
    name: "Mannaz",
    aett: "Tyr",
    symbol: "ᛗ",
    canReverse: true,
    coreMeaning: "Humanity, the self among others — self-awareness, social connection, your place in the community.",
    keywords: ["self", "community", "social role", "identity", "interdependence"],
    upright: {
      interpretation:
        "Mannaz turns attention to your own role in this — how well you understand yourself, and how honestly you're relating to the people around you. Outcomes here are shaped by self-awareness.",
      guidance: "Look at your own part in this clearly before looking anywhere else.",
      yesNo: "possibly",
    },
    reversed: {
      interpretation:
        "Reversed, Mannaz is isolation or self-deception — cutting yourself off from support, or refusing to see your own role in the situation.",
      guidance: "Reach out rather than withdraw. And be honest about your own contribution to this.",
      yesNo: "unlikely",
    },
    domains: {
      love: "Real mutual understanding; reversed, emotional withdrawal or self-deception about the relationship.",
      career: "Being seen accurately by colleagues; reversed, feeling invisible or misunderstood at work.",
      money: "Financial decisions grounded in honest self-assessment.",
      personalDevelopment: "A clearer, more honest sense of who you are.",
      decisions: "Get outside perspective — you may be too close to see this clearly.",
      challenges: "Facing your own part in a recurring pattern.",
    },
  },
  {
    id: 21,
    name: "Laguz",
    aett: "Tyr",
    symbol: "ᛚ",
    canReverse: true,
    coreMeaning: "Water — intuition, emotion, the undercurrent, what flows beneath the visible situation.",
    keywords: ["intuition", "emotion", "flow", "the unconscious", "sensitivity"],
    upright: {
      interpretation:
        "Laguz says the real information here is emotional, not logical — your intuition is picking up something true, even if you can't yet explain it in words.",
      guidance: "Trust the feeling under the facts. It's more reliable right now than the reasoning.",
      yesNo: "likely_yes",
    },
    reversed: {
      interpretation:
        "Reversed, Laguz is intuition drowned out — by fear, wishful thinking, or other people's opinions. The undercurrent is still there, but it's being ignored or misread.",
      guidance: "Get quiet enough to hear yourself again before trusting any read on this.",
      yesNo: "uncertain",
    },
    domains: {
      love: "A deep emotional current between two people; reversed, feelings being suppressed or misread.",
      career: "Following a gut instinct about a role or direction; reversed, ignoring a bad feeling about a job.",
      money: "An intuitive read on a financial risk; reversed, emotional decision-making with money.",
      personalDevelopment: "Reconnecting with your own emotional truth.",
      decisions: "Let feeling inform this as much as logic.",
      challenges: "Emotions that are real but hard to articulate.",
    },
  },
  {
    id: 22,
    name: "Ingwaz",
    aett: "Tyr",
    symbol: "ᛜ",
    canReverse: false,
    coreMeaning: "Ing, the fertility god — internal readiness, a seed fully formed and about to release.",
    keywords: ["fertility", "readiness", "gestation", "quiet completion", "potential fulfilled"],
    upright: {
      interpretation:
        "Ingwaz marks something that has been quietly developing and is now genuinely ready to move into the next phase — the internal work is done, even if it isn't visible yet.",
      guidance: "Trust that the preparation phase is complete. What comes next will happen on its own.",
      yesNo: "yes",
    },
    reversed: null,
    domains: {
      love: "A relationship, or your own readiness for one, quietly coming to fullness.",
      career: "A project or skillset finally mature enough to launch.",
      money: "A financial plan that has matured and is ready to pay off.",
      personalDevelopment: "Recognizing your own readiness instead of waiting for permission.",
      decisions: "You're more prepared for this than you feel.",
      challenges: "The wait before release — the hardest part is nearly over.",
    },
  },
  {
    id: 23,
    name: "Dagaz",
    aett: "Tyr",
    symbol: "ᛞ",
    canReverse: false,
    coreMeaning: "Daybreak — breakthrough, sudden clarity, a genuine turning point from one state to another.",
    keywords: ["breakthrough", "transformation", "clarity", "turning point", "awakening"],
    upright: {
      interpretation:
        "Dagaz is one of the most decisive runes in the deck — a real turning point, where what was true yesterday stops applying and something clearly better begins. It doesn't hedge.",
      guidance: "Step through this doorway. Hesitating here costs more than acting does.",
      yesNo: "yes",
    },
    reversed: null,
    domains: {
      love: "A clear before-and-after moment in a relationship — often for the better.",
      career: "A genuine breakthrough — promotion, pivot, or new direction.",
      money: "A turning point from struggle to stability.",
      personalDevelopment: "A real shift in how you see yourself or your situation.",
      decisions: "This is the moment to commit — the turning point is now.",
      challenges: "Trusting a change that feels almost too sudden to believe.",
    },
  },
  {
    id: 24,
    name: "Othala",
    aett: "Tyr",
    symbol: "ᛟ",
    canReverse: true,
    coreMeaning: "Ancestral land, inheritance — what belongs to you by root, home, family, and legacy.",
    keywords: ["home", "inheritance", "legacy", "roots", "belonging"],
    upright: {
      interpretation:
        "Othala points to something that is fundamentally, rightfully yours — a place, a relationship, or a role you belong to at a deep level, even if it's been in question recently.",
      guidance: "Return to what actually grounds you. The answer is closer to home than it appears.",
      yesNo: "likely_yes",
    },
    reversed: {
      interpretation:
        "Reversed, Othala is a disconnection from roots — feeling like an outsider in your own life, a family pattern repeating unhelpfully, or holding on to something you've actually already outgrown.",
      guidance: "Be honest about what you're clinging to out of habit rather than genuine belonging.",
      yesNo: "unlikely",
    },
    domains: {
      love: "A relationship that feels like home; reversed, staying somewhere out of obligation rather than belonging.",
      career: "Work that aligns with your real values; reversed, a role that doesn't fit who you've become.",
      money: "Inherited or long-term stable resources; reversed, financial patterns inherited from family that no longer serve you.",
      personalDevelopment: "Reconnecting with what genuinely matters to you.",
      decisions: "Choose what aligns with your roots and values, not what's trendy.",
      challenges: "Letting go of a belonging that has become a limitation.",
    },
  },
];

// Wyrd — the 25th card. No family, no symbol, never reversed, and is not
// interpreted through the standard yes/no or domain lenses: it represents
// what cannot yet be known, and the reading engine treats it as such.
export const WYRD: Rune = {
  id: 0,
  name: "Wyrd",
  aett: "Wyrd",
  symbol: "◇",
  canReverse: false,
  coreMeaning:
    "The Unknown — the blank rune. Fate not yet written, a door that has not yet been opened, an outcome that depends entirely on choices not yet made.",
  keywords: ["fate", "the unknown", "unwritten", "open door", "beyond prediction"],
  upright: {
    interpretation:
      "Wyrd does not answer the question directly — it says the outcome genuinely has not been decided yet, by fate or by you. This is not evasiveness; it's the most honest answer the runes can give when the future is still being shaped by choices not yet made.",
    guidance:
      "Whatever you decide next matters more than usual right now. There is no predetermined outcome here to uncover — there is only the one you're about to create.",
    yesNo: "uncertain",
  },
  reversed: null,
  domains: {
    love: "The relationship's future is genuinely unwritten — shaped by what both people choose next, not by fate.",
    career: "An open path with no predetermined outcome — entirely dependent on the choices ahead.",
    money: "An outcome that hasn't been set in motion yet.",
    personalDevelopment: "Standing at a genuinely open threshold.",
    decisions: "There is no 'correct' hidden answer here — this decision is yours to make freely.",
    challenges: "Sitting with real, unresolved uncertainty without forcing false clarity.",
  },
};

export const ALL_CARDS: Rune[] = [...RUNES, WYRD];

export function getRuneById(id: number): Rune {
  const rune = ALL_CARDS.find((r) => r.id === id);
  if (!rune) throw new Error(`Unknown rune id: ${id}`);
  return rune;
}

/**
 * Draws `count` DISTINCT cards, like pulling from a physical deck rather
 * than rolling dice per slot — a multi-card spread should never show the
 * same rune twice.
 */
export function drawSpread(count: number): { rune: Rune; reversed: boolean }[] {
  const deck = [...ALL_CARDS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, count).map((rune) => ({
    rune,
    reversed: rune.canReverse ? Math.random() < 0.5 : false,
  }));
}
