import { Story, Meta } from "@storybook/web-components";
import { html } from "lit";
import { FrostInput } from "../../lit-components/index";
FrostInput;


export default {
   title: "Frostflow/Input",
   parameters: { // this works but says deprecated
      actions: {
         handles: [ "value", "change" ],
      },
   },
   argTypes: {
      theme: {
         options: [ "frost", "dark" ],
         control: { type: "select" }
      },
      state: {
         options: [ "active", "disabled" ],
         control: { type: "check" }
      },
      // onValue: { action: 'onClick' },
   },
} as Meta;

// export const parameters = {
//    actions: {
//       handles: [ "value", "change" ],
//    },
// };

const Template: Story = ( { label, value, theme, state } ) => html`
   <frost-input @value=${ console.log } .label=${ label } .value=${ value } .theme=${ theme } .state=${ state as string[] }></frost-input>
`;


export const Dark = Template.bind( {} );
Dark.args = {
   label: "input label",
   value: "input value",
   theme: "dark",
   state: [] as string[]
};
export const Light = Template.bind( {} );
Light.args = {
   label: "input label",
   value: "input value",
   theme: "frost",
   state: [] as string[]
};