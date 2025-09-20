// src/app/animations.ts
import { 
  trigger, 
  transition, 
  style, 
  query, 
  group, 
  animate, 
  stagger, 
  keyframes,
  animateChild
} from '@angular/animations';

export const routeTransition = trigger('routeTransition', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px) scale(0.98)' })
    ], { optional: true }),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', keyframes([
          style({ opacity: 1, transform: 'translateY(0) scale(1)', offset: 0 }),
          style({ opacity: 0.5, transform: 'translateX(-20px) scale(0.99)', offset: 0.5 }),
          style({ opacity: 0, transform: 'translateX(-30px) scale(0.98)', offset: 1 })
        ]))
      ], { optional: true }),
      query(':enter', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', keyframes([
          style({ opacity: 0, transform: 'translateY(20px) scale(0.98)', offset: 0 }),
          style({ opacity: 0.7, transform: 'translateY(5px) scale(0.99)', offset: 0.5 }),
          style({ opacity: 1, transform: 'translateY(0) scale(1)', offset: 1 })
        ]))
      ], { optional: true })
    ]),
    query(':enter', animateChild(), { optional: true })
  ])
]);

export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('150ms ease-out', style({ opacity: 1 }))
  ])
]);


export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('500ms ease-out', style({ opacity: 0 }))
  ])
]);


export const slideIn = trigger('slideIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(-20px)' }),
    animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
  ])
]);

export const staggerList = trigger('staggerList', [
  transition('* => *', [
    query(':enter', stagger('50ms', [
      animate('150ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))  
    ]), { optional: true })
  ]) 
]);