/**
 * import { CheckCircleIcon } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Container } from '@kit/ui/container';
import { Hero } from '@kit/ui/marketing';
import { SubHeading } from '@kit/ui/sub-heading';
import { Heading } from '@kit/ui/heading';
 
function Pricing() {
  return (
    <div className='flex h-full flex-1 flex-col space-y-8 lg:space-y-16'>
      <div className={'flex h-full flex-1 flex-col space-y-8 lg:space-y-16'}>
        <div className={'flex flex-col items-center justify-center'}>
          <Hero>Pricing</Hero>
 
          <SubHeading>
            Choose the plan that&apos;s right for you. All plans include a 14-day
            free trial.
          </SubHeading>
        </div>
 
        <div>
          <table className={'Table'}>
            <tbody className={'[&>tr>td]:px-2 sm:[&>tr>td]:px-6'}>
            <tr
              className={
                'flex flex-col space-y-8 divide-y divide-gray-50 !border-b-gray-200 dark:divide-dark-800 sm:table-row [&>td]:py-4'
              }
            >
              <td className={'hidden sm:table-cell'} />
 
              <td>
                <div className={'flex w-full flex-col space-y-6'}>
                  <div className={'flex flex-col space-y-2'}>
                    <Heading type={3}>Starter</Heading>
 
                    <span className={'text-gray-500 dark:text-gray-400'}>
                      A Starter plan designed for hobbyists and freelancers.
                    </span>
                  </div>
 
                  <p>
                    <span className={'text-4xl font-extrabold'}>Free</span>
                  </p>
 
                  <div>
                    <ul className={'flex flex-col space-y-4'}>
                      <li className={'flex items-center space-x-3'}>
                        <div>
                          <CheckCircleIcon className={'h-6'} />
                        </div>
 
                        <span className={'text-sm'}>Up to 2 projects</span>
                      </li>
 
                      <li className={'flex items-center space-x-3'}>
                        <div>
                          <CheckCircleIcon className={'h-6'} />
                        </div>
 
                        <span className={'text-sm'}>Up to 5 collaborators</span>
                      </li>
 
                      <li className={'flex items-center space-x-3'}>
                        <div>
                          <CheckCircleIcon className={'h-6'} />
                        </div>
 
                        <span className={'text-sm'}>Up to 1,000 API calls</span>
                      </li>
                    </ul>
                  </div>
 
                  <Button className={'sm:hidden'} block>
                    Select Plan
                  </Button>
                </div>
              </td>
 
              <td>
                <div className={'flex w-full flex-col space-y-6'}>
                  <div className={'flex flex-col space-y-2'}>
                    <div className={'flex items-center justify-between'}>
                      <Heading type={3}>Pro</Heading>
 
                      <div>
                        <span
                          className={
                            'rounded bg-primary-500 p-1.5 text-xs font-semibold text-white'
                          }
                        >
                          Most Popular
                        </span>
                      </div>
                    </div>
 
                    <span className={'text-gray-500 dark:text-gray-400'}>
                      A plan designed for small teams, startups and agencies.
                    </span>
                  </div>
 
                  <p>
                    <span className={'text-4xl font-extrabold'}>
                      $49<span className={'text-base'}>/monthly</span>
                    </span>
                  </p>
 
                  <div>
                    <ul className={'flex flex-col space-y-4'}>
                      <li className={'flex items-center space-x-3'}>
                        <div>
                          <CheckCircleIcon className={'h-6'} />
                        </div>
 
                        <span className={'text-sm'}>Up to 10 projects</span>
                      </li>
 
                      <li className={'flex items-center space-x-3'}>
                        <div>
                          <CheckCircleIcon className={'h-6'} />
                        </div>
 
                        <span className={'text-sm'}>
                          Up to 10 collaborators
                        </span>
                      </li>
 
                      <li className={'flex items-center space-x-3'}>
                        <div>
                          <CheckCircleIcon className={'h-6'} />
                        </div>
 
                        <span className={'text-sm'}>
                          Up to 10,000 API calls
                        </span>
                      </li>
                    </ul>
                  </div>
 
                  <Button className={'sm:hidden'} block>
                    Select Plan
                  </Button>
                </div>
              </td>
 
              <td>
                <div className={'flex w-full flex-col space-y-6'}>
                  <div className={'flex flex-col space-y-2'}>
                    <Heading type={3}>Premium</Heading>
 
                    <span className={'text-gray-500 dark:text-gray-400'}>
                      A plan designed for large teams and enterprises.
                    </span>
                  </div>
 
                  <p>
                    <span className={'text-4xl font-extrabold'}>
                      $99<span className={'text-base'}>/monthly</span>
                    </span>
                  </p>
 
                  <div>
                    <ul className={'flex flex-col space-y-4'}>
                      <li className={'flex items-center space-x-3'}>
                        <div>
                          <CheckCircleIcon className={'h-6'} />
                        </div>
 
                        <span className={'text-sm'}>Unlimited projects</span>
                      </li>
 
                      <li className={'flex items-center space-x-3'}>
                        <div>
                          <CheckCircleIcon className={'h-6'} />
                        </div>
 
                        <span className={'text-sm'}>
                          Unlimited collaborators
                        </span>
                      </li>
 
                      <li className={'flex items-center space-x-3'}>
                        <div>
                          <CheckCircleIcon className={'h-6'} />
                        </div>
 
                        <span className={'text-sm'}>Unlimited API calls</span>
                      </li>
                    </ul>
                  </div>
 
                  <Button className={'sm:hidden'} block>
                    Select Plan
                  </Button>
                </div>
              </td>
            </tr>
 
            <tr className={'hidden sm:table-row'}>
              <td className={'font-semibold'}>Projects</td>
              <td>2</td>
              <td>5</td>
              <td>Unlimited</td>
            </tr>
 
            <tr className={'hidden sm:table-row'}>
              <td className={'font-semibold'}>Collaborators</td>
              <td>5</td>
              <td>10</td>
              <td>Unlimited</td>
            </tr>
 
            <tr className={'hidden sm:table-row'}>
              <td className={'font-semibold'}>API Calls</td>
              <td>1,000</td>
              <td>10,000</td>
              <td>Unlimited</td>
            </tr>
 
            <tr className={'hidden sm:table-row'}>
              <td className={'font-semibold'}>100+ Integrations</td>
              <td>
                <CheckCircleIcon className={'h-5 text-green-500'} />
              </td>
              <td>
                <CheckCircleIcon className={'h-5 text-green-500'} />
              </td>
              <td>
                <CheckCircleIcon className={'h-5 text-green-500'} />
              </td>
            </tr>
 
            <tr className={'hidden sm:table-row'}>
              <td className={'font-semibold'}>Community Support</td>
              <td>
                <CheckCircleIcon className={'h-5 text-green-500'} />
              </td>
              <td>
                <CheckCircleIcon className={'h-5 text-green-500'} />
              </td>
              <td>
                <CheckCircleIcon className={'h-5 text-green-500'} />
              </td>
            </tr>
 
            <tr className={'hidden sm:table-row'}>
              <td className={'font-semibold'}>Chat Support</td>
              <td>-</td>
              <td>
                <CheckCircleIcon className={'h-5 text-green-500'} />
              </td>
              <td>
                <CheckCircleIcon className={'h-5 text-green-500'} />
              </td>
            </tr>
 
            <tr className={'hidden sm:table-row'}>
              <td className={'font-semibold'}>Phone Support</td>
              <td>-</td>
              <td>-</td>
              <td>
                <CheckCircleIcon className={'h-5 text-green-500'} />
              </td>
            </tr>
 
            <tr className={'hidden sm:table-row'}>
              <td className={'font-semibold'}>Account Manager</td>
              <td>-</td>
              <td>-</td>
              <td>
                <CheckCircleIcon className={'h-5 text-green-500'} />
              </td>
            </tr>
 
            <tr className={'hidden sm:table-row'}>
              <td></td>
              <td>
                <Button block>Select Plan</Button>
              </td>
              <td>
                <Button block>Select Plan</Button>
              </td>
              <td>
                <Button block>Select Plan</Button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}
 */