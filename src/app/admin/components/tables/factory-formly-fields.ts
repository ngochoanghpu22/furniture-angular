import { AdminTypes, Company, Team, User, UserRole } from '@flex-team/core';
import { FormlyFieldConfig } from '@ngx-formly/core';

const Formly_Fields_User: FormlyFieldConfig[] = [
  {
    key: 'firstName',
    type: 'input',
    templateOptions: {
      label: 'First name',
      placeholder: 'Enter first name',
      required: true,
    },
  },
  {
    key: 'lastName',
    type: 'input',
    templateOptions: {
      label: 'Last name',
      placeholder: 'Enter last name',
      required: true,
    },
  },
  {
    key: 'email',
    type: 'input',
    templateOptions: {
      label: 'Email address',
      placeholder: 'Enter email',
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$'
    },
  },
  {
    key: 'role',
    type: 'multicheckbox',
    templateOptions: {
      label: 'Roles',
      placeholder: 'Roles of user',
      required: true,
      options: [
        { value: UserRole.Admin, label: 'Admin' },
        { value: UserRole.User, label: 'User' },
        { value: UserRole.FullManager, label: 'Full Manager' },
        { value: UserRole.HRManager, label: 'HR Manager' },

        { value: UserRole.OfficeManager, label: 'Office Manager' },
        { value: UserRole.TeamManager, label: 'Team Manager' },
        { value: UserRole.StatManager, label: 'Stat Manager' },
        { value: UserRole.OrganizationManager, label: 'Organization Manager' },
        { value: UserRole.Beta, label: 'Beta users' }
      ],
    },
  },
  {
    key: 'teamName',
    type: 'input',
    templateOptions: {
      label: 'Team name',
      placeholder: 'Enter team name',
      required: true,
    },
  },
];

const Formly_Fields_Company: FormlyFieldConfig[] = [
  {
    key: 'name',
    type: 'input',
    templateOptions: {
      label: 'Name',
      placeholder: 'Enter name',
      required: true,
    },
  },
];

const Formly_Fields_Team: FormlyFieldConfig[] = [
  {
    key: 'name',
    type: 'input',
    templateOptions: {
      label: 'Name',
      placeholder: 'Enter name',
      required: true,
    },
  },
  {
    key: 'description',
    type: 'input',
    templateOptions: {
      label: 'Description',
      placeholder: 'Enter description',
      required: false,
    },
  },
  {
    key: 'visibility',
    type: 'radio',
    defaultValue: 'public',
    templateOptions: {
      label: 'Visibility',
      options: [
        { value: 'public', label: 'Public' },
        { value: 'private', label: 'Private' },
      ],
      required: true,
    },
  },
  {
    key: 'idOwner',
    type: 'select',
    templateOptions: {
      label: 'Owner',
      options: [],
      required: true,
    },
  },
  {
    key: 'isHierarchy',
    type: 'checkbox',
    defaultValue: false,
    templateOptions: {
      label: 'Hierarchy',
    },
    hooks: {
      onInit: (field: FormlyFieldConfig) => {
        field.form.get('isHierarchy').valueChanges
          .subscribe(val => {
            const tabs = val ? [false, false] : [true, false];
            ['isWorking', 'isSocial'].map((k, index) => {
              if (field.form.get(k)) {
                field.form.get(k).setValue(tabs[index], {
                  onlySelf: true,
                  emitEvent: false
                });
              }
              field.model[k] = tabs[index];
            })

          });
      }
    }
  },
  {
    key: 'isPrefered',
    type: 'checkbox',
    defaultValue: false,
    templateOptions: {
      label: 'Prefered',
    },
  },
  {
    key: 'isSocial',
    type: 'checkbox',
    defaultValue: false,
    templateOptions: {
      label: 'Social',
    },
    hooks: {
      onInit: (field: FormlyFieldConfig) => {
        field.form.get('isSocial').valueChanges
          .subscribe(val => {
            const tabs = val ? [false, false] : [true, false];
            ['isWorking', 'isHierarchy'].map((k, index) => {
              if (field.form.get(k)) {
                field.form.get(k).setValue(tabs[index], {
                  onlySelf: true,
                  emitEvent: false
                });
              }
              field.model[k] = tabs[index];
            })

          });
      }
    }
  },
  {
    key: 'isWorking',
    type: 'checkbox',
    defaultValue: true,
    templateOptions: {
      label: 'Work',
    },
    hooks: {
      onInit: (field: FormlyFieldConfig) => {
        field.form.get('isWorking').valueChanges
          .subscribe(val => {
            const tabs = val ? [false, false] : [true, false];
            ['isSocial', 'isHierarchy'].map((k, index) => {
              if (field.form.get(k)) {
                field.form.get(k).setValue(tabs[index], {
                  onlySelf: true,
                  emitEvent: false
                });
              }
              field.model[k] = tabs[index];
            })
          });
      }
    }
  },
  {
    key: 'noticePeriod',
    type: 'input',
    templateOptions: {
      label: 'Notice Period',
      placeholder: 'Enter notice period',
      required: true,
      type: 'number',
      min: 0,
      max: 7,
    },
  },
  {
    key: 'userToInclude',
    type: 'textarea',
    templateOptions: {
      label: 'Users to include (email)',
      placeholder: 'Enter emails or lines',
      required: false,
    },
  },
];

export const factoryFormlyFields = (type: AdminTypes): FormlyFieldConfig[] => {
  switch (type) {
    case AdminTypes.User:
      return Formly_Fields_User;
    case AdminTypes.Company:
      return Formly_Fields_Company;
    case AdminTypes.Team:
      return Formly_Fields_Team;
    default:
      return [];
  }
};

export const factoryRawModel = (type: string): any => {
  switch (type) {
    case AdminTypes.User:
      return new User();
    case AdminTypes.Company:
      return new Company();
    case AdminTypes.Team:
      return new Team();
    default:
      return [];
  }
};
