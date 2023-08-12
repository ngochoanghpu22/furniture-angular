import { AnimationTriggerMetadata, trigger, transition, style, animate, state, query, stagger, keyframes, group } from "@angular/animations";
const left = [
    query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
    group([
        query(':enter', [
            style({ transform: 'translateX(-100%)' }),
            animate('.2s ease-out',
                style({ transform: 'translateX(0%)' }))
        ], { optional: true }),
        query(':leave', [
            style({ transform: 'translateX(0%)' }),
            animate('.2s ease-out',
                style({ transform: 'translateX(100%)' }))
        ], { optional: true }),
    ]),
];

const right = [
    query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
    group([
        query(':enter', [
            style({ transform: 'translateX(100%)' }),
            animate('.2s ease-out',
                style({ transform: 'translateX(0%)' }))
        ], { optional: true }),
        query(':leave', [
            style({ transform: 'translateX(0%)' }),
            animate('.2s ease-out',
                style({ transform: 'translateX(-100%)' }))
        ], { optional: true }),
    ]),
];
export const FxtAnimations: {
    readonly slideDown: AnimationTriggerMetadata,
    readonly slideLeftRight: AnimationTriggerMetadata,
    readonly openClose: AnimationTriggerMetadata,
    readonly rotate: AnimationTriggerMetadata,
    readonly fadeOut: AnimationTriggerMetadata,
} = {

    slideDown: trigger('openClose', [
        state('open', style({
            height: '*',
            opacity: 1,
        })),
        state('closed', style({
            height: '0px',
            opacity: 0,
        })),
        transition('open => closed', animate('0.1s')),
        transition('closed => open', animate('0.1s')),
    ]),

    slideLeftRight: trigger('animSlider', [
        transition(':increment', right), transition(':decrement', left)
    ]),

    openClose: trigger('openClose', [
        state('open', style({
            height: '*',
            transform: 'scale(1)',
            opacity: 1,
        })),
        state('closed', style({
            height: '0px',
            transform: 'scaleY(0)',
            opacity: 0,
        })),
        transition('open => closed', animate('0.3s')),
        transition('closed => open', animate('0.3s')),
    ]),

    rotate: trigger('rotate', [
        state('open', style({
            height: '*',
            transform: 'rotate(90deg)',
        })),
        state('closed', style({
            height: '*',
            transform: 'rotate(0deg)',
        })),
        transition('open => closed', animate('0.3s')),
        transition('closed => open', animate('0.3s')),
    ]),

    fadeOut: trigger('fadeOut', [
        state('in', style({ opacity: 1 })),
        transition(':enter', [
            style({ opacity: 0 }),
            animate(200)
        ]),
        transition(':leave',
            animate(200, style({ opacity: 0 })))
    ])
};
