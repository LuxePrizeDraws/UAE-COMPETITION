// Region-specific compliance messaging for UAE Competition Platform

export type Region = 'UK' | 'UAE' | 'GLOBAL';

export interface ComplianceMessage {
  ageRequirement: string;
  ageWarning: string;
  gamblingWarning: string;
  responsibleGambling: string;
  regulatoryBody: string;
  helpResources: string[];
  spendingWarning: string;
  taxDisclaimer: string;
}

export const complianceMessages: Record<Region, ComplianceMessage> = {
  UK: {
    ageRequirement: 'You must be 18 or over to enter. Age verification required.',
    ageWarning: '18+ only. Underage entry is strictly prohibited under the UK Gambling Act 2005.',
    gamblingWarning:
      'This is a "Win to Buy" promotional competition. Entry odds are clearly displayed. Please play responsibly.',
    responsibleGambling:
      'Gambling can be addictive. Set a budget and stick to it. If you feel you may have a problem, please seek help.',
    regulatoryBody: 'UK Gambling Commission (UKGC) — www.gamblingcommission.gov.uk',
    helpResources: [
      'GamCare: www.gamcare.org.uk | 0808 8020 133',
      'Gamblers Anonymous: www.gamblersanonymous.org.uk',
      'BeGambleAware: www.begambleaware.org | 0808 8020 133',
      'Gordon Moody Association: www.gordonmoody.org.uk',
    ],
    spendingWarning:
      'You have reached 80% of your recommended monthly spending limit of £500. Please consider whether you wish to continue.',
    taxDisclaimer:
      'Prize winnings may be subject to UK income tax. Winners are solely responsible for any tax obligations arising from prizes received.',
  },
  UAE: {
    ageRequirement: 'You must be 21 or over to enter. Age verification required.',
    ageWarning: '21+ only. Entry by persons under 21 is not permitted.',
    gamblingWarning:
      'This is a promotional "Win to Buy" competition based on chance. This platform is operated in compliance with applicable UAE regulations.',
    responsibleGambling:
      'Please participate responsibly. Set limits on your spending and do not exceed what you can afford to lose.',
    regulatoryBody: 'Dubai Financial Services Authority (DFSA) — www.dfsa.ae',
    helpResources: [
      'Dubai Wellbeing Observatory: www.wellbeing.ae',
      'Ministry of Health UAE Helpline: 800-HEALTH (800-43258)',
    ],
    spendingWarning:
      'You are approaching your recommended monthly spending limit. Please consider whether you wish to continue.',
    taxDisclaimer:
      'UAE residents: prize winnings may be subject to applicable local taxes or duties. Winners are solely responsible for any tax obligations.',
  },
  GLOBAL: {
    ageRequirement: 'You must be 18 or over (or the applicable legal age in your jurisdiction) to enter.',
    ageWarning: 'Age verification is required. Underage entry is strictly prohibited.',
    gamblingWarning:
      'This is a "Win to Buy" promotional competition. Entry odds are transparently displayed. Please participate responsibly.',
    responsibleGambling:
      'Please play responsibly. Participation should remain fun and within your financial means.',
    regulatoryBody: 'Contact our compliance team at compliance@uaecompetition.com',
    helpResources: [
      'National Problem Gambling Helpline (US): 1-800-522-4700',
      'Gamblers Anonymous International: www.gamblersanonymous.org',
    ],
    spendingWarning:
      'You are approaching your monthly spending limit. Please consider whether you wish to continue.',
    taxDisclaimer:
      'Winners are solely responsible for any taxes, duties, or levies applicable in their jurisdiction.',
  },
};

export const getComplianceMessages = (region: Region = 'GLOBAL'): ComplianceMessage => {
  return complianceMessages[region];
};

export const RESTRICTED_COUNTRIES = [
  'United States',
  'North Korea',
  'Iran',
  'Cuba',
  'Syria',
  'Russia',
];

export const MONTHLY_SPEND_SOFT_CAP_GBP = 500;
export const MAX_ENTRIES_PER_DRAW = 100;
export const PRIZE_DELIVERY_DAYS = 14;
export const MIN_AGE_UK = 18;
export const MIN_AGE_UAE = 21;
