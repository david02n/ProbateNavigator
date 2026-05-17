# Probate Navigator / ProbateSwift PRD

## 1. Product summary

Probate Navigator is an early-stage prototype for a digital probate guidance product for England and Wales. The intended product direction is ProbateSwift: a service that helps people understand, prepare, and progress through a probate application with less confusion, less admin, and fewer emotionally taxing steps.

The product is not intended to replace a solicitor for complex estates. It is intended to support the common, relatively straightforward probate journey where a user needs clarity, structured data capture, document organisation, and step-by-step guidance.

The initial product focus should be the "happy path":

- England and Wales probate.
- A will exists.
- One or more executors/applicants are eligible to apply.
- The estate is likely excepted from inheritance tax or otherwise can be routed clearly.
- No major dispute, insolvency, complex trust, foreign probate complexity, or contested estate.

The product should help users reach one of three outcomes:

1. Probate appears not to be required.
2. Probate is required and the user can proceed through a guided application journey.
3. The case is too complex or risky for self-service and the user should seek specialist legal support.

## 2. Problem

Applying for probate is confusing, emotionally loaded, and administratively fragmented. Users are often dealing with grief while trying to understand unfamiliar legal, tax, banking, and government processes.

Common user problems:

- They do not know whether probate is required.
- They do not know whether they are eligible to apply.
- They do not know which documents they need.
- They do not know whether inheritance tax forms or declarations are required.
- They struggle to translate government guidance into actionable next steps.
- They lose track of who is involved, which assets exist, and which documents have been collected.
- They do not know when a solicitor is genuinely needed versus when they can proceed themselves.

The current market has a gap between generic government guidance, expensive solicitor-led services, and simple checklist articles. Probate Navigator should sit in the middle: structured, affordable, guided, and designed for non-experts.

## 3. Target users

### Primary user

A layperson in England or Wales who is responsible for dealing with the estate of someone who has died.

Typical examples:

- Named executor in a will.
- Spouse or adult child helping with the estate.
- Family member unsure whether probate is required.
- Person who wants to avoid unnecessary solicitor costs but needs confidence.

### Secondary users

- Probate service providers who may want a better intake and automation layer.
- Legal or estate administration professionals who want a structured front-end for low-complexity cases.
- Friends/family helping an applicant gather documents and information.

## 4. Product goals

### User goals

- Understand whether probate is needed.
- Understand whether they are eligible to apply.
- Know what documents and information are needed.
- Capture deceased, applicant, estate, and document information in one place.
- Understand whether the estate is likely excepted from inheritance tax or whether IHT400/HMRC work is needed.
- Progress through a clear checklist/milestone journey.
- Avoid accidental mistakes caused by misunderstanding the process.
- Know when to stop and seek professional advice.

### Business/product goals

- Prove demand for a guided probate workflow.
- Validate whether users will trust a structured digital service for probate.
- Build a reusable domain model for probate cases.
- Create a foundation for automated document intake and form population.
- Identify the simplest productised wedge: assessment, document collection, application preparation, or partner-facing intake.

## 5. Non-goals for the first productised version

The first productised version should not try to handle every estate.

Out of scope for v1:

- Full solicitor replacement.
- Contested estates.
- Insolvent estates.
- Complex trusts.
- Complex foreign assets or cross-border probate.
- Complex inheritance tax planning.
- Automated legal advice.
- Submission directly to HMCTS or HMRC unless integration feasibility is later proven.
- Guaranteeing probate approval.

The product can still identify these scenarios and route users away from self-service.

## 6. Core user journey

### Step 1: Landing-page assessment

User answers a short assessment to determine:

- Has someone died?
- Did they live/die within scope for England and Wales probate?
- Is there a will?
- Is the user likely eligible to apply?
- Does probate appear likely to be required?
- Are there obvious red flags?

Output:

- Simple result.
- Recommended next step.
- CTA to create an account and continue.

### Step 2: Account creation

User signs up or logs in.

The app creates or resumes a draft probate case tied to the authenticated user.

### Step 3: Case dashboard

Dashboard shows:

- Current case state.
- Next recommended action.
- Progress/milestones.
- Missing information.
- Key documents needed.
- Safe routing messages if the case becomes complex.

### Step 4: Detailed evaluation

User answers a deeper set of questions covering:

- About the deceased.
- Jurisdiction and domicile.
- Will and executors.
- Applicant eligibility.
- Estate/tax threshold indicators.
- IHT readiness.
- Complexity/risk flags.

Output:

- Case type/routing state.
- Required sections.
- Required documents.
- Warnings/blockers.
- Milestones to unlock.

### Step 5: People capture

User adds and completes profiles for:

- Deceased.
- Applicant(s).
- Executor(s).
- Non-applying executors, where relevant.
- Other people only where needed.

### Step 6: Document capture

User uploads and categorises documents such as:

- Death certificate.
- Will.
- Codicils.
- IHT confirmation or relevant tax evidence.
- Renunciation/power reserved evidence where required.
- Asset/liability documents where relevant.

### Step 7: Estate capture

User records:

- Assets.
- Liabilities.
- Estimated estate values.
- Property ownership.
- Joint/sole ownership.
- Foreign or complex assets, if present.

### Step 8: Application readiness

The app determines whether the user appears ready to proceed and what remains missing.

Potential outputs:

- Ready to complete probate application.
- Needs more information/documents.
- Needs IHT400/HMRC step first.
- Needs professional advice.

## 7. MVP feature requirements

### 7.1 Authentication and case ownership

- Users must authenticate before storing case data.
- Each case must be tied to exactly one owner user.
- All case data must be scoped to the authenticated user.
- There must be no hardcoded fallback user or case IDs.

### 7.2 Case lifecycle

- Create a draft probate case for a user.
- Resume existing active case.
- Store case status.
- Track progress.
- Support a single active case initially.

### 7.3 Assessment

- Store landing assessment results if completed.
- Allow users to skip landing assessment and begin in-app evaluation.
- Do not force duplicate assessment if information has already been gathered.

### 7.4 Evaluation flow

- Present one question at a time or section-by-section.
- Support conditional logic.
- Auto-save answers.
- Derive routing flags from answers.
- Show blockers where the case is out of scope.
- Avoid obsolete form references.

### 7.5 People

- Add/edit/delete people tied to a case.
- Mark a person as deceased, applicant, executor, or other relevant role.
- Track completeness by scenario.
- Prompt user to complete missing required information.

### 7.6 Estate

- Add/edit/delete assets and liabilities.
- Tie documents to assets/liabilities where useful.
- Summarise gross and net estate values.
- Support future determination of excepted estate indicators.

### 7.7 Documents

- Upload documents.
- Store document metadata.
- Categorise by type.
- Track status: uploaded, processing, verified, rejected, needs review.
- Show missing required document types based on case state.

### 7.8 Tasks and milestones

- Generate tasks based on evaluation flags.
- Show required and optional tasks.
- Track completion.
- Unlock next sections based on required data.
- Keep the next recommended action obvious.

## 8. Compliance and trust requirements

This product handles sensitive personal, legal, financial, and death-related information. Trust must be designed into the product from the start.

Requirements:

- Clear disclaimers: guidance, not legal advice.
- Clear out-of-scope routing.
- Strong privacy posture.
- Secure authentication.
- Private document storage.
- Audit-friendly data model.
- No public exposure of uploaded documents.
- No use of personal case data for model training without explicit consent.
- Avoid overclaiming certainty in legal/tax routing.

## 9. Current prototype state

The current repo already contains useful early product structure:

- React app with dashboard, people, estate, documents, upload, deceased details, and evaluation pages.
- Clerk authentication scaffolding.
- Express backend.
- Drizzle/Postgres schema for users, cases, people, estate items, documents, tasks, and evaluation responses.
- Evaluation question configuration.
- Milestone-oriented UX concepts.

However, the current backend is not yet complete. Many frontend flows expect API routes that are not currently implemented. The prototype should be treated as a scaffold, not a production-ready application.

## 10. Success metrics

### Prototype validation metrics

- % of users who complete the initial assessment.
- % of users who create an account after assessment.
- % of users who complete the detailed evaluation.
- % of users who successfully create a draft case.
- % of required information completed per case.
- Number of cases routed out as too complex.
- User-reported confidence before/after using the app.

### Productisation metrics

- Time to reach application-readiness state.
- Drop-off points by flow section.
- Support/contact requests by category.
- Document upload completion rate.
- Assessment-to-paid conversion, if monetised.
- Partner intake completion rate, if partner-led.

## 11. Open product questions

- Is the best initial wedge consumer self-service, solicitor-assisted intake, or probate service provider tooling?
- Should the first paid product be assessment, guided application prep, document review, or form completion?
- How much automation should happen before trust is earned?
- Should AI be visible as a chatbot or mostly hidden behind structured guidance?
- What is the clearest pricing model: one-off fee, document pack, assisted review, or partner licensing?
- What exact case types are safe enough for v1 self-service?

## 12. Product principles

- Reduce emotional load.
- Make the next step obvious.
- Ask only what is needed.
- Explain legal/tax concepts in plain English.
- Be honest when the case is too complex.
- Prefer structured progress over open-ended chat.
- Use AI to remove admin, not to pretend to be a solicitor.
- Preserve user trust over short-term conversion.
