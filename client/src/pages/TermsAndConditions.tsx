import './TermsAndConditions.css';

const TermsAndConditions = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <header className="terms-header">
          <h1>Terms &amp; Conditions</h1>
          <p className="terms-last-updated">Last updated: August 2026 | Version 1.0</p>
          <div className="terms-compliance-badges">
            <span className="badge badge-uk">UK Gambling Commission Compliant</span>
            <span className="badge badge-uae">UAE Regulations Compliant</span>
            <span className="badge badge-gdpr">GDPR Compliant</span>
          </div>
        </header>

        <div className="terms-toc">
          <h2>Table of Contents</h2>
          <ol>
            <li><a href="#nature">Nature of Competition</a></li>
            <li><a href="#eligibility">Eligibility &amp; Age Verification</a></li>
            <li><a href="#entry">Entry &amp; Payment Terms</a></li>
            <li><a href="#prizes">Prize Details &amp; Odds</a></li>
            <li><a href="#fairplay">Fair Play &amp; Integrity</a></li>
            <li><a href="#responsible">Responsible Gambling</a></li>
            <li><a href="#data">Data Protection &amp; Privacy</a></li>
            <li><a href="#liability">Limitations of Liability</a></li>
            <li><a href="#disputes">Dispute Resolution</a></li>
            <li><a href="#suspension">Account Suspension &amp; Termination</a></li>
            <li><a href="#general">General Provisions</a></li>
          </ol>
        </div>

        <section id="nature" className="terms-section">
          <h2>1. Nature of Competition</h2>

          <h3>1.1 "Win to Buy" Model</h3>
          <p>
            UAE Competition Platform (the "Platform", "we", "us", "our") operates a "Win to Buy"
            promotional competition model. This is a prize competition in which participants purchase
            entries for the chance to win a prize. This is <strong>not</strong> a lottery or gambling
            product as defined under the UK Gambling Act 2005, as winners are determined through a
            certified random number generator (RNG) draw — not by any element of financial investment
            or betting.
          </p>

          <h3>1.2 Entry Mechanism</h3>
          <p>
            Each competition requires the purchase of one or more entry tickets at a fixed price per
            entry, as displayed on each competition card. Each ticket is assigned a unique entry number.
            A draw is conducted when the required number of entries has been sold (or at the specified
            draw date, whichever comes first), selecting one or more winning entry numbers at random.
          </p>

          <h3>1.3 Odds Transparency</h3>
          <p>
            We are committed to full transparency. The odds of winning any competition are displayed
            on each competition card as "1 in [remaining entries]" and as a percentage. Odds change
            dynamically as entries are sold. The final odds at draw time are calculated as 1 divided
            by the total number of valid entries at the time of the draw.
          </p>

          <h3>1.4 Operator Details</h3>
          <p>
            UAE Competition Platform is operated by [Company Name Ltd], registered in [Jurisdiction],
            Company Number [XXXXXXXX]. Registered address: [Full Address]. For queries contact us at:{' '}
            <a href="mailto:support@uaecompetition.com">support@uaecompetition.com</a>.
          </p>
        </section>

        <section id="eligibility" className="terms-section">
          <h2>2. Eligibility &amp; Age Verification</h2>

          <h3>2.1 Age Requirements</h3>
          <p>
            Participation in competitions on this Platform is subject to the following minimum age
            requirements:
          </p>
          <ul>
            <li>
              <strong>United Kingdom residents:</strong> You must be aged 18 or over. This is in
              compliance with the UK Gambling Act 2005 and associated Remote Gambling Regulations 2014.
            </li>
            <li>
              <strong>UAE residents:</strong> You must be aged 21 or over, in accordance with
              applicable UAE regulations.
            </li>
            <li>
              <strong>All other jurisdictions:</strong> You must be aged 18 or over, or the applicable
              legal age of majority in your country of residence, whichever is higher.
            </li>
          </ul>
          <p>
            We reserve the right to request proof of age at any time. Entries made by persons below the
            applicable minimum age will be void and any winnings forfeited.
          </p>

          <h3>2.2 Age Verification Process</h3>
          <p>
            We use third-party age verification services to confirm eligibility. You may be required to
            provide: a valid passport, driving licence, or national identity card. Failure to complete
            age verification within 72 hours of a winning draw will result in prize forfeiture.
          </p>

          <h3>2.3 Restricted Territories</h3>
          <p>
            Participation is not permitted from the following countries or territories (this list is
            subject to change):
          </p>
          <ul>
            <li>United States of America and its territories</li>
            <li>North Korea (Democratic People's Republic of Korea)</li>
            <li>Iran (Islamic Republic of Iran)</li>
            <li>Cuba</li>
            <li>Syria</li>
            <li>Russia</li>
            <li>Any country subject to UN, UK, EU, or UAE sanctions</li>
          </ul>
          <p>
            We use IP geolocation technology to enforce these restrictions. Attempts to circumvent
            geographic restrictions (e.g., via VPN) will result in immediate account termination and
            forfeiture of entries and winnings.
          </p>

          <h3>2.4 Accuracy of Information</h3>
          <p>
            You must provide accurate and truthful information when creating your account and at all
            times during your use of the Platform. Providing false information, including a false date
            of birth or address, constitutes a material breach of these Terms and may result in
            account suspension, cancellation of entries, and forfeiture of any winnings.
          </p>

          <h3>2.5 Exclusions</h3>
          <p>
            The following persons are not eligible to participate: employees, officers, and directors
            of the Platform and its affiliates; immediate family members of the above; third-party
            service providers engaged in operating competitions on the Platform.
          </p>
        </section>

        <section id="entry" className="terms-section">
          <h2>3. Entry &amp; Payment Terms</h2>

          <h3>3.1 Entry Price</h3>
          <p>
            The price per entry ticket is displayed on each individual competition card. All prices are
            shown in AED (UAE Dirham) or GBP (£) as applicable. No purchase is necessary where a free
            entry route is available; details of any free entry route are set out in the relevant
            competition's specific terms.
          </p>

          <h3>3.2 Payment Methods</h3>
          <p>We accept the following payment methods:</p>
          <ul>
            <li>Credit and debit cards (Visa, Mastercard)</li>
            <li>Apple Pay / Google Pay</li>
            <li>Bank transfer (selected markets)</li>
          </ul>
          <p>
            All transactions are processed through PCI DSS-compliant payment processors. We do not
            store your full card details on our servers.
          </p>

          <h3>3.3 Non-Refundable Entries</h3>
          <p>
            All entry purchases are final and non-refundable once submitted, except where required by
            applicable consumer protection law. If a competition is cancelled by us (other than for
            reasons of your default), we will refund all entry fees paid for that competition within
            14 working days.
          </p>

          <h3>3.4 Maximum Entries Per Draw</h3>
          <p>
            A maximum of <strong>100 entries per draw</strong> applies to each individual participant
            per competition. This limit is in place to promote fair participation. The system will
            automatically prevent purchases exceeding this limit.
          </p>

          <h3>3.5 Monthly Spending Limits</h3>
          <p>
            We operate a recommended soft spending cap of <strong>£500 per calendar month</strong> (or
            AED equivalent) per account. When you approach 80% of this limit, you will receive a
            spending alert. We encourage all players to set personal spending limits within their
            account settings. Hard limits may be mandated in certain regulatory jurisdictions.
          </p>

          <h3>3.6 Customer Funds Protection</h3>
          <p>
            Player funds held on account (prepaid balances) are held in a segregated client account
            with [Bank Name], separate from our operational funds. This provides protection in the
            event of the Platform's insolvency. This protection meets the "basic" level as defined by
            the UK Gambling Commission.
          </p>
        </section>

        <section id="prizes" className="terms-section">
          <h2>4. Prize Details &amp; Odds</h2>

          <h3>4.1 Transparent Odds</h3>
          <p>
            The odds of winning each competition are prominently displayed on every competition card,
            both as a ratio (e.g., "1 in 10,000") and as a percentage. Odds are updated in real time
            as entries are sold. We do not manipulate or misrepresent odds at any time.
          </p>

          <h3>4.2 Prize Structure</h3>
          <p>
            Prizes may include cash, physical goods, experiences, or a combination thereof. Where a
            cash alternative is offered, it will be clearly stated on the competition card. The cash
            alternative value may differ from the stated retail value of the primary prize. Unless
            otherwise specified, the winner must choose between the primary prize and cash alternative
            within 14 days of being notified.
          </p>

          <h3>4.3 Draw Mechanism &amp; Timing</h3>
          <p>
            Draws are conducted using a certified, independently audited Random Number Generator (RNG).
            Draws take place either when all available entries have been sold or at the published draw
            deadline, whichever occurs first. In the event of a draw deadline being reached with fewer
            entries than the maximum sold, we reserve the right to either (a) conduct the draw with
            entries sold, or (b) cancel the competition and issue refunds, as stated in the specific
            competition terms.
          </p>

          <h3>4.4 Prize Delivery &amp; Payout Timeframe</h3>
          <p>
            Winners will be notified within 48 hours of the draw via the contact details registered
            on their account. Prize delivery or payment will be completed within{' '}
            <strong>14 calendar days</strong> of the winner's identity and eligibility being verified.
            Physical prizes are delivered at no cost to the winner within the UK and UAE. International
            delivery costs may apply for other regions and will be communicated to the winner.
          </p>

          <h3>4.5 Tax Liability</h3>
          <p>
            Winners are solely and entirely responsible for any taxes, duties, levies, or charges
            applicable to prizes received, in accordance with the laws of their country of residence.
            The Platform does not deduct tax from prizes and does not provide tax advice. We recommend
            winners consult a qualified tax professional regarding their obligations.
          </p>

          <h3>4.6 Unclaimed Prizes</h3>
          <p>
            If a winner fails to claim their prize within 90 days of notification, the prize will be
            forfeited and will be re-entered into a future competition or donated to a nominated charity
            at the Platform's discretion.
          </p>
        </section>

        <section id="fairplay" className="terms-section">
          <h2>5. Fair Play &amp; Integrity</h2>

          <h3>5.1 RNG Certification</h3>
          <p>
            All draws are conducted using a Random Number Generator (RNG) that has been independently
            tested and certified to meet international standards for fairness and unpredictability
            (eCOGRA or equivalent accreditation body). Certification details are available upon request.
          </p>

          <h3>5.2 Live Draw Verification</h3>
          <p>
            Where technically feasible, draws are conducted live and streamed on our official social
            media channels. An independent scrutineer may be present to verify the draw process. The
            winning entry number and winner details are published on the Platform within 24 hours of
            the draw.
          </p>

          <h3>5.3 No Manipulation Guarantee</h3>
          <p>
            We guarantee that draws are not subject to manipulation by any party, including our
            employees, directors, shareholders, or technology providers. Any discovered attempt to
            influence draw outcomes will be reported to relevant regulatory and law enforcement
            authorities.
          </p>

          <h3>5.4 Fraud &amp; Disqualification</h3>
          <p>
            We reserve the right to disqualify any participant and void their entries if we have
            reasonable grounds to believe that: (a) fraudulent activity has occurred; (b) entries were
            purchased using stolen payment methods; (c) bots or automated systems were used to purchase
            entries; (d) multiple accounts have been created to circumvent per-draw entry limits; or
            (e) any other form of cheating, collusion, or manipulation has taken place. Disqualified
            participants forfeit all entries and winnings and may be reported to appropriate authorities.
          </p>
        </section>

        <section id="responsible" className="terms-section">
          <h2>6. Responsible Gambling</h2>

          <div className="responsible-gambling-banner">
            <p>
              ⚠️ <strong>Responsible Gambling Notice:</strong> Competitions should be fun.
              If you feel that your participation is becoming a problem, please use the tools available
              to you or contact a support organisation immediately.
            </p>
          </div>

          <h3>6.1 Self-Exclusion</h3>
          <p>
            You may self-exclude from the Platform at any time by contacting us at{' '}
            <a href="mailto:responsible@uaecompetition.com">responsible@uaecompetition.com</a> or
            through your account settings. Self-exclusion periods of 6 months, 1 year, 5 years, or
            permanent exclusion are available. During the self-exclusion period, your account will be
            suspended and you will be unable to re-register.
          </p>
          <p>
            UK residents may also register with <strong>GAMSTOP</strong> (www.gamstop.co.uk) for
            cross-operator exclusion.
          </p>

          <h3>6.2 Deposit &amp; Spending Limits</h3>
          <p>
            You can set daily, weekly, and monthly spending limits on your account. Once set, these
            limits cannot be increased for a minimum of 7 days (cooling-off period). We encourage all
            players to set limits that reflect their personal financial situation.
          </p>

          <h3>6.3 Time-Outs &amp; Reality Checks</h3>
          <p>
            You may set a "time-out" period (24 hours to 6 weeks) during which your account will be
            temporarily suspended. Reality check notifications can be enabled in your account settings
            to remind you of time spent on the Platform.
          </p>

          <h3>6.4 Loss Limits</h3>
          <p>
            A loss limit feature is available in your account settings, allowing you to cap the amount
            you can spend within a given period regardless of outcomes. Reducing a loss limit takes
            effect immediately; increasing it is subject to a 7-day cooling-off period.
          </p>

          <h3>6.5 Help Resources</h3>
          <p>
            If you believe you may have a gambling problem, please reach out to one of the following
            free and confidential support organisations:
          </p>
          <ul className="help-resources">
            <li>
              <strong>GamCare (UK):</strong>{' '}
              <a href="https://www.gamcare.org.uk" target="_blank" rel="noopener noreferrer">
                www.gamcare.org.uk
              </a>{' '}
              | Free helpline: <strong>0808 8020 133</strong> (24/7)
            </li>
            <li>
              <strong>BeGambleAware (UK):</strong>{' '}
              <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer">
                www.begambleaware.org
              </a>{' '}
              | <strong>0808 8020 133</strong>
            </li>
            <li>
              <strong>Gamblers Anonymous (UK):</strong>{' '}
              <a href="https://www.gamblersanonymous.org.uk" target="_blank" rel="noopener noreferrer">
                www.gamblersanonymous.org.uk
              </a>
            </li>
            <li>
              <strong>Gordon Moody Association:</strong>{' '}
              <a href="https://www.gordonmoody.org.uk" target="_blank" rel="noopener noreferrer">
                www.gordonmoody.org.uk
              </a>
            </li>
            <li>
              <strong>UAE — Ministry of Health Helpline:</strong> 800-HEALTH (800-43258)
            </li>
          </ul>
        </section>

        <section id="data" className="terms-section">
          <h2>7. Data Protection &amp; Privacy</h2>

          <h3>7.1 GDPR &amp; UK Data Protection Compliance</h3>
          <p>
            We process your personal data in compliance with the UK General Data Protection Regulation
            (UK GDPR), the Data Protection Act 2018, and where applicable, the EU General Data
            Protection Regulation (EU GDPR 2016/679). Our lawful bases for processing include
            contractual necessity, legal obligation, and legitimate interests.
          </p>

          <h3>7.2 UAE Data Protection</h3>
          <p>
            For UAE residents, we comply with applicable UAE data protection laws, including Federal
            Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL) and relevant DIFC and
            ADGM data protection frameworks where applicable.
          </p>

          <h3>7.3 Data We Collect</h3>
          <p>We collect and process the following categories of personal data:</p>
          <ul>
            <li>
              <strong>Identity data:</strong> Name, date of birth, government-issued ID (for age
              verification)
            </li>
            <li>
              <strong>Contact data:</strong> Email address, phone number, postal address
            </li>
            <li>
              <strong>Financial data:</strong> Payment card details (processed via our payment
              provider; not stored by us), transaction history
            </li>
            <li>
              <strong>Technical data:</strong> IP address, browser type, device identifiers, cookies
            </li>
            <li>
              <strong>Usage data:</strong> Competition entries, spending history, account activity
            </li>
            <li>
              <strong>Communications data:</strong> Support tickets, correspondence
            </li>
          </ul>

          <h3>7.4 How We Use Your Data</h3>
          <p>Your data is used to: operate your account and process entries; verify your age and
          identity; process payments; comply with legal and regulatory obligations; detect and prevent
          fraud; send service communications; and improve our Platform.</p>

          <h3>7.5 Your Rights</h3>
          <p>You have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Right of access:</strong> Request a copy of your personal data</li>
            <li><strong>Right to rectification:</strong> Request correction of inaccurate data</li>
            <li><strong>Right to erasure:</strong> Request deletion of your data (subject to legal
            retention requirements)</li>
            <li><strong>Right to portability:</strong> Receive your data in a machine-readable format</li>
            <li><strong>Right to object:</strong> Object to processing based on legitimate interests</li>
            <li><strong>Right to restrict:</strong> Request restriction of processing in certain
            circumstances</li>
          </ul>
          <p>
            To exercise any of these rights, contact our Data Protection Officer at{' '}
            <a href="mailto:dpo@uaecompetition.com">dpo@uaecompetition.com</a>.
          </p>

          <h3>7.6 Data Retention</h3>
          <p>
            We retain personal data for as long as your account is active and for a period of 7 years
            thereafter, to comply with legal, regulatory, and tax obligations. Certain data relating to
            winning entries is retained permanently as part of our audit trail obligations.
          </p>

          <h3>7.7 Terms Acceptance Audit Log</h3>
          <p>
            When you accept these Terms &amp; Conditions, we record your acceptance including the
            timestamp, your IP address, and the version of terms accepted. This record is maintained
            for compliance and audit purposes.
          </p>
        </section>

        <section id="liability" className="terms-section">
          <h2>8. Limitations of Liability</h2>

          <h3>8.1 Technical Failures</h3>
          <p>
            To the fullest extent permitted by applicable law, we are not liable for any loss or
            damage arising from: temporary or permanent Platform unavailability; loss of data; errors
            in competition entry processing; or delays caused by third-party service providers,
            provided such failures do not result from our gross negligence or wilful misconduct.
          </p>

          <h3>8.2 Platform Availability</h3>
          <p>
            We do not guarantee uninterrupted access to the Platform. Scheduled and emergency
            maintenance windows may result in temporary downtime. We will endeavour to provide advance
            notice of scheduled maintenance where possible.
          </p>

          <h3>8.3 Force Majeure</h3>
          <p>
            We are not liable for any failure or delay in performing our obligations under these Terms
            where such failure or delay results from events beyond our reasonable control, including but
            not limited to: acts of God; war or terrorism; pandemic or epidemic; government regulations
            or regulatory action; industrial action; or failure of third-party telecommunications or
            internet services. We will notify you as soon as reasonably practicable of any such event
            and its anticipated duration.
          </p>

          <h3>8.4 Limitation of Financial Liability</h3>
          <p>
            Subject to clause 8.5, our total aggregate liability to you in connection with these Terms
            shall not exceed the total amount paid by you for entry tickets in the 12 months preceding
            the event giving rise to the liability.
          </p>

          <h3>8.5 Exclusions</h3>
          <p>
            Nothing in these Terms excludes or limits our liability for: death or personal injury
            caused by our negligence; fraud or fraudulent misrepresentation; any liability that cannot
            be excluded by law; or any liability under the Consumer Rights Act 2015 (UK) or equivalent
            consumer protection legislation.
          </p>
        </section>

        <section id="disputes" className="terms-section">
          <h2>9. Dispute Resolution</h2>

          <h3>9.1 Complaints Procedure</h3>
          <p>
            If you have a complaint, please contact our customer support team in the first instance:
          </p>
          <ul>
            <li>
              Email:{' '}
              <a href="mailto:complaints@uaecompetition.com">complaints@uaecompetition.com</a>
            </li>
            <li>Response time: We aim to acknowledge all complaints within 24 hours and provide a
            full response within 8 weeks.</li>
          </ul>

          <h3>9.2 Alternative Dispute Resolution (ADR) — UK</h3>
          <p>
            If you are not satisfied with our response to your complaint, UK customers may refer their
            dispute to our approved ADR provider: <strong>[ADR Provider Name]</strong>, accessible
            at [ADR website]. This service is free of charge to consumers.
          </p>
          <p>
            UK customers may also use the{' '}
            <strong>Online Dispute Resolution (ODR) Platform</strong> provided by the European
            Commission at:{' '}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://ec.europa.eu/consumers/odr
            </a>
          </p>

          <h3>9.3 Escalation to Regulatory Bodies</h3>
          <p>You may escalate unresolved complaints to:</p>
          <ul>
            <li>
              <strong>UK:</strong> UK Gambling Commission —{' '}
              <a href="https://www.gamblingcommission.gov.uk" target="_blank" rel="noopener noreferrer">
                www.gamblingcommission.gov.uk
              </a>
            </li>
            <li>
              <strong>UAE:</strong> Relevant UAE Consumer Protection Authority or DFSA (for
              DIFC-related matters)
            </li>
            <li>
              <strong>Data protection complaints (UK):</strong> Information Commissioner's Office
              (ICO) —{' '}
              <a href="https://www.ico.org.uk" target="_blank" rel="noopener noreferrer">
                www.ico.org.uk
              </a>
            </li>
          </ul>

          <h3>9.4 Governing Law</h3>
          <p>
            These Terms are governed by and construed in accordance with the laws of England and Wales.
            Any dispute arising out of or in connection with these Terms shall be subject to the
            exclusive jurisdiction of the courts of England and Wales, unless alternative dispute
            resolution is pursued as set out above.
          </p>
        </section>

        <section id="suspension" className="terms-section">
          <h2>10. Account Suspension &amp; Termination</h2>

          <h3>10.1 Grounds for Suspension</h3>
          <p>We may suspend or terminate your account if we have reasonable grounds to believe that:</p>
          <ul>
            <li>You have provided false or misleading information</li>
            <li>You do not meet the eligibility criteria set out in Section 2</li>
            <li>Fraudulent activity has occurred on your account</li>
            <li>You have breached any provision of these Terms</li>
            <li>Your account is being used in a manner that is harmful to the Platform or other users</li>
            <li>We are required to do so by law or regulatory obligation</li>
          </ul>

          <h3>10.2 Fraud Detection</h3>
          <p>
            We use automated fraud detection systems to monitor account activity. Suspicious activity,
            including but not limited to the use of stolen payment instruments, coordinated entry
            purchasing, or account sharing, will trigger a review. Accounts subject to review may be
            temporarily suspended pending investigation.
          </p>

          <h3>10.3 Appeal Process</h3>
          <p>
            If your account is suspended, you will be notified by email with the reason for suspension
            (to the extent permitted by law). You may appeal a suspension by emailing{' '}
            <a href="mailto:appeals@uaecompetition.com">appeals@uaecompetition.com</a> within 30 days
            of receiving the suspension notice. We will respond to appeals within 14 working days.
          </p>

          <h3>10.4 Effect of Termination</h3>
          <p>
            Upon account termination: (a) all pending entries in ongoing competitions will be voided
            and refunded if termination is without cause; (b) if termination is due to breach of
            these Terms, entries and winnings may be forfeited; (c) any credit balance on your account
            will be returned to you within 14 working days (subject to verification) unless we have
            grounds to withhold such funds under applicable law.
          </p>
        </section>

        <section id="general" className="terms-section">
          <h2>11. General Provisions</h2>

          <h3>11.1 Changes to Terms</h3>
          <p>
            We reserve the right to amend these Terms at any time. We will provide at least 14 days'
            notice of material changes by email and by displaying a notice on the Platform. Your
            continued use of the Platform after the effective date of changes constitutes your
            acceptance of the amended Terms. If you do not accept the amended Terms, you must cease
            using the Platform and close your account.
          </p>

          <h3>11.2 Severability</h3>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision
            shall be limited or eliminated to the minimum extent necessary, and the remaining
            provisions shall continue in full force and effect.
          </p>

          <h3>11.3 Entire Agreement</h3>
          <p>
            These Terms, together with our Privacy Policy and any competition-specific terms, constitute
            the entire agreement between you and us in relation to the Platform and supersede all prior
            agreements and understandings.
          </p>

          <h3>11.4 Regulatory Compliance</h3>
          <p>
            This Platform operates in compliance with the following regulatory frameworks:
          </p>
          <ul>
            <li>UK Gambling Act 2005</li>
            <li>Gambling (Licensing and Advertising) Act 2014</li>
            <li>Remote Gambling Regulations 2014</li>
            <li>UK GDPR and Data Protection Act 2018</li>
            <li>UAE Federal Decree-Law No. 45 of 2021 (PDPL)</li>
            <li>Consumer Rights Act 2015 (UK)</li>
          </ul>

          <h3>11.5 Contact Information</h3>
          <p>For all enquiries:</p>
          <ul>
            <li>General support: <a href="mailto:support@uaecompetition.com">support@uaecompetition.com</a></li>
            <li>Complaints: <a href="mailto:complaints@uaecompetition.com">complaints@uaecompetition.com</a></li>
            <li>Responsible gambling: <a href="mailto:responsible@uaecompetition.com">responsible@uaecompetition.com</a></li>
            <li>Data protection: <a href="mailto:dpo@uaecompetition.com">dpo@uaecompetition.com</a></li>
            <li>Appeals: <a href="mailto:appeals@uaecompetition.com">appeals@uaecompetition.com</a></li>
            <li>Compliance: <a href="mailto:compliance@uaecompetition.com">compliance@uaecompetition.com</a></li>
          </ul>
        </section>

        <footer className="terms-footer">
          <p>
            © 2026 UAE Competition Platform. All rights reserved.
          </p>
          <p>
            These Terms &amp; Conditions were last reviewed by our legal team in August 2026.
          </p>
          <p className="terms-legal-note">
            <strong>Note:</strong> This document is provided for informational purposes and does not
            constitute legal advice. We recommend consulting a qualified legal professional for advice
            specific to your circumstances.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default TermsAndConditions;
