import {
    Building,
    Square,
    File,
    Paintbrush,
    Group,
    User,
  } from 'lucide-react';
   
  import { Heading } from "~/components/shadcn/heading";
   
  function FeatureIcon(props: React.PropsWithChildren) {
    return (
      <div className={'flex justify-center'}>
        <div
          className={'rounded-xl bg-primary-500/10 p-4 dark:bg-primary-500/10'}
        >
          {props.children}
        </div>
      </div>
    );
  }
   
  export function FeaturesList() {
    return (
      <div className={'grid gap-12 lg:grid-cols-3'}>
        <div className={'flex flex-col space-y-3 text-center'}>
        <FeatureIcon>
          <User className={'h-6'} />
        </FeatureIcon>
   
        <Heading level={3}>Authentication</Heading>
   
        <div className={'text-gray-500 dark:text-gray-400'}>
          Secure and Easy-to-Use Authentication for Your SaaS Website
        </div>
      </div>
   
      <div className={'flex flex-col space-y-3 text-center'}>
        <FeatureIcon>
          <Building className={'h-6'} />
        </FeatureIcon>
   
        <Heading level={3}>Multi-Tenancy</Heading>
   
        <div className={'text-gray-500 dark:text-gray-400'}>
          Powerful Multi-Tenancy Features for Maximum Flexibility and Efficiency
        </div>
      </div>
   
      <div className={'flex flex-col space-y-3 text-center'}>
        <FeatureIcon>
          <Group className={'h-6'} />
        </FeatureIcon>
   
        <Heading level={3}>Team-Management</Heading>
   
        <div className={'text-gray-500 dark:text-gray-400'}>
          Effortlessly Manage and Organize Your Team Members
        </div>
      </div>
   
      <div className={'flex flex-col space-y-3 text-center'}>
        <FeatureIcon>
          <Paintbrush className={'h-6'} />
        </FeatureIcon>
   
        <Heading level={3}>UI Themes</Heading>
   
        <div className={'text-gray-500 dark:text-gray-400'}>
          Customizable UI Themes to Match Your Brand and Style
        </div>
      </div>
   
      <div className={'flex flex-col space-y-3 text-center'}>
        <FeatureIcon>
          <Square className={'h-6'} />
        </FeatureIcon>

        <Heading level={3}>UI Components</Heading>
   
        <div className={'text-gray-500 dark:text-gray-400'}>
          Pre-built UI Components to Speed Up Your Development
        </div>
      </div>
   
      <div className={'flex flex-col space-y-3 text-center'}>
        <FeatureIcon>
          <File className={'h-6'} />
        </FeatureIcon>

        <Heading level={3}>Blog and Documentation</Heading>
   
        <div className={'text-gray-500 dark:text-gray-400'}>
          Pre-built Blog and Documentation Pages to Help Your Users
        </div>
      </div>
    </div>
  );
}
