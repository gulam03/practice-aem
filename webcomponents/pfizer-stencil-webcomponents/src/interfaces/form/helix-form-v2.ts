/* eslint-disable @typescript-eslint/no-explicit-any */

/*
  The classes in this file will be exposed to the end developers
  consuming the helix-form. They will have to confirm to the below
  contracts when passing the config to the component.
*/

// @todo: Delete this type once TS is updated to 4.5.
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#the-awaited-type-and-promise-improvements
type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

type RequiredProperty<T, K extends keyof T> = Omit<T, K> & Pick<Required<T>, K>;

export type HelixFormFieldModelWithPrepopulate = RequiredProperty<HelixFormFieldModel, 'prepopulate'>;

export interface HelixFormPrepopulateProvider<T = unknown> {
  /**
   * The asynchronous data gatherer. The returned data is passed
   * to the {@see setData}.
   */
  getData(): Promise<T | null>;

  /**
   * The synchronous field mutator. Called during each form render
   * for the fields with the `prepopulate` config.
   *
   * During the first call, the {@see data} param is likely to be
   * `null` as the {@see getData} might not have gathered the data
   * yet. This condition can be used to prepopulate the default
   * value. When the {@see getData} async operation is complete,
   * the {@see setData} is called again with the {@see data} set to
   * what's returned.
   */
  setData(field: HelixFormFieldModelWithPrepopulate, data: T | null): void;
}

export interface HelixFormPrepopulateProviders {
  grv: HelixFormPrepopulateProvider;
}

export type HelixFormPrepopulateProvidersStore = {
  [P in keyof HelixFormPrepopulateProviders]?: Awaited<ReturnType<HelixFormPrepopulateProviders[P]['getData']>>;
};

export interface HelixFormServiceModel {
  service: string;
  active: boolean;
  config: HelixFormConfigModel;
  updatedAt: string;
  configToken: string;
  description: string;
  name: string;
}

export interface HelixFormConfigModel {
  csrfToken: string;
  fields?: HelixFormFieldModel[];
}

export interface HelixFormFieldModelBase {
  name: string;
  id?: string;
  value?: any;
  label: string;
  placeholder?: string;
  order: number;
  validators?: HelixValidatorItem[];
  attributes?: any[];
  sectionRef?: string;
  prepopulate?: {
    provider: keyof HelixFormPrepopulateProviders;
    expression: string;
  };
  enabled?: boolean;
  required?: boolean;
}

export interface HelixFormFieldModelOptionsBase extends HelixFormFieldModelBase {
  options: HelixOptionItem[];
  optionText?: string;
  optionValue?: string;
}

export interface HelixFormFieldModelText extends HelixFormFieldModelBase {
  type: 'text';
}

export interface HelixFormFieldModelHidden extends HelixFormFieldModelBase {
  type: 'hidden';
}

export interface HelixFormFieldModelEmail extends HelixFormFieldModelBase {
  type: 'email';
}

export interface HelixFormFieldModelPassword extends HelixFormFieldModelBase {
  type: 'password';
}

export interface HelixFormFieldModelTextarea extends HelixFormFieldModelBase {
  type: 'textarea';
}

export interface HelixFormFieldModelSelect extends HelixFormFieldModelOptionsBase {
  type: 'select';
}

export interface HelixFormFieldModelCheckbox extends HelixFormFieldModelBase {
  type: 'checkbox';
}

export interface HelixFormFieldModelCheckboxes extends HelixFormFieldModelOptionsBase {
  type: 'checkboxes';
}

export interface HelixFormFieldModelRadio extends HelixFormFieldModelOptionsBase {
  type: 'radio';
}

export interface HelixFormFieldModelAutocomplete extends HelixFormFieldModelBase {
  type: 'autocomplete';
}

export interface HelixFormFieldModelDate extends HelixFormFieldModelBase {
  type: 'date';
}

export interface HelixFormFieldModelTime extends HelixFormFieldModelBase {
  type: 'time';
}

export interface HelixFormFieldModelButton extends HelixFormFieldModelBase {
  type: 'button';
}

export interface HelixFormFieldModelSection extends HelixFormFieldModelBase {
  type: 'section';
  childFieldRefs: string[];
  children?: HelixFormFieldModel[];
  childFieldMaxCount?: number;
  childFieldMinCount?: number;
  childFieldInitialCount?: number;
  removeButtonText?: string;
  addButtonText?: string;
}

export interface HelixFormFieldModelHtml extends HelixFormFieldModelBase {
  type: 'html';
  html: string;
}

export interface HelixFormFieldModelNumber extends HelixFormFieldModelBase {
  type: 'number';
  step: number;
}

// eslint-disable-next-line prettier/prettier
export type HelixFormFieldModel =
  | HelixFormFieldModelText
  | HelixFormFieldModelHidden
  | HelixFormFieldModelEmail
  | HelixFormFieldModelPassword
  | HelixFormFieldModelTextarea
  | HelixFormFieldModelSelect
  | HelixFormFieldModelCheckbox
  | HelixFormFieldModelCheckboxes
  | HelixFormFieldModelRadio
  | HelixFormFieldModelAutocomplete
  | HelixFormFieldModelDate
  | HelixFormFieldModelTime
  | HelixFormFieldModelButton
  | HelixFormFieldModelHtml
  | HelixFormFieldModelNumber
  | HelixFormFieldModelSection;

export interface HelixFormPlumbing {
  model: HelixFormFieldModel;
  /**
   * @param refHandler
   *
   * Used for the internal form mapping service
   * so elements can be identified when rendered
   * and appropriate behaviours added
   */
  render(refHandler): any;
}

export interface HelixOptionItem {
  label: string;
  value: string;
  default?: boolean;
}

export interface HelixValidatorItem {
  // eslint-disable-next-line prettier/prettier
  type:
    | 'name'
    | 'required'
    | 'alpha'
    | 'email'
    | 'regex'
    | 'minValue'
    | 'maxValue'
    | 'minLength'
    | 'maxLength'
    | 'minListLength'
    | 'maxListLength'
    | 'compare'
    | 'date'
    | 'time'
    | 'enabled'
    | 'number';
  value?: number | RegExp | string;
  message?: string;
  condition?: any;
  conditions?: any;
  formats?: string[];
  dependencies?: Record<string, unknown>[];
}

export interface HelixValidatorState {
  name: 'enabled' | 'required';
  default: boolean;
  extract: boolean;
}

export interface HelixValidatorDependencyItem {
  name: string;
  validators: RequiredProperty<HelixValidatorItem, 'dependencies'>[];
  states: Record<keyof HelixValidatorState['name'], boolean>;
}

export type HelixValidatorDependencies = Record<string, HelixValidatorDependencyItem>;
