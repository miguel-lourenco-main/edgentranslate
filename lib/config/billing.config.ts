/**
 * This is a sample billing configuration file. You should copy this file to `billing.config.ts` and then replace
 * the configuration with your own billing provider and products.
 */
import { BillingProviderSchema, createBillingSchema } from '~/lib/schemas/create-billing-schema';

// The billing provider to use. This should be set in the environment variables
// and should match the provider in the database. We also add it here so we can validate
// your configuration against the selected provider at build time.
const provider = BillingProviderSchema.parse(
  process.env.NEXT_PUBLIC_BILLING_PROVIDER,
);

export default createBillingSchema({
  // also update config.billing_provider in the DB to match the selected
  provider,
  // products configuration
  products: [
    {
      id: 'free',
      name: 'Free',
      description: 'A basic subscription meant to get you started',
      currency: 'USD',
      plans: [
        {
          name: 'Free Monthly',
          id: 'free-monthly',
          paymentType: 'recurring',
          interval: 'month',
          lineItems: [{
            id: 'price_1Qk5WWA9qjC84Lu5LDeFku05',
            name: 'Flat',
            cost: 0,
            type: 'flat',

          }],
        },
      ],
      features: [
        "Pages per Month: 5",
        "File types: .pdf, .pptx, .docx",
        "Styling Preserved",
        "{languagesLink}",
        "AI GPT-Powered Translation",
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Perfect for professionals with higher volume needs',
      currency: 'USD',
      badge: 'Popular',
      highlighted: true,
      plans: [
        {
          name: 'Pro Monthly',
          id: 'pro-monthly',
          paymentType: 'recurring',
          interval: 'month',
          lineItems: [
            {
              id: 'price_1Qk5ehA9qjC84Lu5u5yxku6M',
              name: 'Tiered',
              cost: 0,
              type: 'tiered',
              unit: 'page',
              tiers: [
                {
                  upTo: 100,
                  cost: 0.25,
                },
                {
                  upTo: 2000,
                  cost: 0.20,
                },
                {
                  upTo: 'unlimited',
                  cost: 0.10,
                }
              ]
            },
          ],
        },
      ],
      features: [
        "Everything in Free plus:",
        "{pagesPerMonth}",
        "No Watermark",
        "API",
      ],
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Designed for businesses with extensive translation requirements',
      currency: 'USD',
      plans: [
        {
          name: 'Business Monthly',
          id: 'business-monthly',
          paymentType: 'recurring',
          interval: 'month',
          custom: true,
          lineItems: [],
        },
      ],
      features: [
        "Everything in Pro plus:",
        "Enterprise support (24 hour SLA)",
        "Enhanced Security",
        "Priority feature requests",
        "Whitelabeling",
      ],
    },
  ]
});