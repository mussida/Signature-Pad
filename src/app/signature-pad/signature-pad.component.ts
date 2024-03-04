import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IMappedEvents } from '../mapped-events.interface';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.css'],
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('signaturePad') signaturePad: ElementRef<HTMLCanvasElement>;
  @ViewChild('button') cancelBtn: ElementRef<HTMLButtonElement>;
  @ViewChild('button') saveBtn: ElementRef<HTMLButtonElement>;
  public context: CanvasRenderingContext2D | null = null;
  public mappedEvents: IMappedEvents = {
    start: ['mousedown', 'touchstart'],
    move: ['mousemove', 'touchmove'],
    end: ['mouseup', 'touchend', 'touchcancel'],
  };

  public drawing = false;
  public prevX = 0;
  public prevY = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.context = this.signaturePad.nativeElement.getContext('2d');
      if (!this.context) return;
      this.context.lineWidth = 2;
      this.context.lineJoin = 'round';
      this.context.lineCap = 'round';
      this.addEventListeners(
        this.signaturePad.nativeElement,
        'start',
        this.onSignatureStart.bind(this)
      );
      this.addEventListeners(
        this.signaturePad.nativeElement,
        'move',
        this.onSignatureMove.bind(this)
      );
      this.addEventListeners(
        this.signaturePad.nativeElement,
        'end',
        this.onSignatureEnd.bind(this)
      );
    }
  }

  addEventListeners(
    element: HTMLElement,
    event: 'start' | 'move' | 'end',
    fn: (arg1: Event) => void
  ) {
    const evtArray = this.mappedEvents[event];
    if (!evtArray) {
      console.log('No events found');
    }
    const len = evtArray.length;
    for (let i = 0; i < len; i++) {
      element.addEventListener(evtArray[i], fn, false);
    }
  }

  onSignatureStart(event: Event) {
    const coords = this.getOffset(event);
    if (!coords) return;
    this.context?.beginPath();
    this.context?.moveTo(coords.x, coords.y);
    this.drawing = true;
    // Initialize prevX and prevY
    this.prevX = coords.x;
    this.prevY = coords.y;
  }
  // onSignatureMove(event: Event) {
  //   // if (!this.drawing) return;
  //   // const coords = this.getOffset(event);
  //   // if (!coords) return;
  //   // this.context?.lineTo(coords.x, coords.y);
  //   // this.context?.stroke();
  //   if (!this.drawing) return;
  //   const coords = this.getOffset(event);
  //   if (!coords) return;
  //   // Calculate control points for bezier curve
  //   const cp1x = (this.prevX + coords.x) / 2;
  //   const cp1y = (this.prevY + coords.y) / 2;

  //   this.context?.beginPath();
  //   this.context?.moveTo(this.prevX, this.prevY);
  //   this.context?.bezierCurveTo(cp1x, cp1y, cp1x, cp1y, coords.x, coords.y);
  //   this.context?.stroke();

  //   // Update prevX and prevY
  //   this.prevX = coords.x;
  //   this.prevY = coords.y;
  // }
  // onSignatureMove(event: Event) {
  //   if (!this.drawing) return;
  //   const coords = this.getOffset(event);
  //   if (!coords) return;

  //   // Calculate control points for quadratic bezier curve
  //   const cp1x = (this.prevX + coords.x) / 2;
  //   const cp1y = (this.prevY + coords.y) / 2;

  //   // quadratic curve
  //   this.context?.beginPath();
  //   this.context?.moveTo(this.prevX, this.prevY);
  //   this.context?.quadraticCurveTo(cp1x, cp1y, coords.x, coords.y);
  //   this.context?.stroke();

  //   // Update prevX and prevY
  //   this.prevX = coords.x;
  //   this.prevY = coords.y;
  // }

  pointsDrawn = 0;
  points: any[] = [];

  onSignatureMove(event: Event) {
    if (!this.drawing) return;
    const coords = this.getOffset(event);
    if (!coords) return;

    const cp0x = (this.prevX + coords.x) / 2;
    const cp0y = (this.prevY + coords.y) / 2;

    // Calculate control points for quadratic bezier curve
    const cp1x = (cp0x + coords.x) / 2;
    const cp1y = (cp0y + coords.y) / 2;

    // draw extra point between prev and current point
    this.context?.beginPath();
    this.context?.moveTo(this.prevX, this.prevY);
    if (!this.context) return;
    this.context.strokeStyle = 'red';
    this.context?.quadraticCurveTo(cp0x, cp0y, cp1x, cp1y);
    this.context.lineWidth = 4;
    this.context?.stroke();

    this.pointsDrawn++;

    if (this.pointsDrawn % 1 === 0) {
      this.points.push({ x: cp1x, y: cp1y });
    }

    this.context.strokeStyle = 'red';
    this.context?.quadraticCurveTo(cp1x, cp1y, coords.x, coords.y);
    this.context.lineWidth = 4;
    this.context?.stroke();

    this.pointsDrawn++;

    if (this.pointsDrawn % 1 === 0) {
      this.points.push({ x: coords.x, y: coords.y });
    }

    // // lineTo
    // this.context?.beginPath();
    // this.context?.moveTo(this.prevX, this.prevY);
    // if (!this.context) return;
    // this.context.strokeStyle = 'blue';
    // this.context?.bezierCurveTo(cp1x, cp1y, cp1x, cp1y, coords.x, coords.y);
    // this.context.lineWidth = 3;
    // this.context?.stroke();

    // Another lineTo with different color
    // this.context?.beginPath();
    // this.context?.moveTo(this.prevX, this.prevY);
    // if (!this.context) return;
    // this.context.strokeStyle = 'green';
    // this.context?.lineTo(coords.x, coords.y);
    // this.context.lineWidth = 2;
    // this.context?.stroke();

    // Update prevX and prevY
    this.prevX = coords.x;
    this.prevY = coords.y;
  }

  onSignatureEnd(event: Event) {
    this.drawing = false;

    this.signatureClear();

    console.log('Points drawn', this.pointsDrawn);

    this.pointsDrawn = 0;

    //draw points with quadratic loop on points array
    for (let i = 0; i < this.points.length - 1; i++) {
      console.log('points');
      const p0 = this.points[i];
      const p1 = this.points[i + 1];

      this.context?.beginPath();
      this.context?.moveTo(p0.x, p0.y);
      this.context?.quadraticCurveTo(p0.x, p0.y, p1.x, p1.y);

      this.context?.stroke();
    }

    this.points = [];
  }

  getOffset(event: Event) {
    const mvEvent = <MouseEvent>event;
    let x = 0;
    let y = 0;

    if (!mvEvent.offsetX || !mvEvent.offsetY) {
      const tEvent = <TouchEvent>event;
      const touches = tEvent.touches;
      //check if more than one finger touch the screen
      if (touches && touches.length > 1) {
        return;
      }
      if (!touches) return;
      const touch = touches[0];
      const rect = (<HTMLElement>event.currentTarget).getBoundingClientRect();
      x = touch.pageX - rect.x;
      y = touch.pageY - rect.y;
    } else {
      x = mvEvent.offsetX;
      y = mvEvent.offsetY;
    }

    return {
      x:
        (x / this.signaturePad.nativeElement.offsetWidth) *
        this.signaturePad.nativeElement.width,
      y:
        (y / this.signaturePad.nativeElement.offsetHeight) *
        this.signaturePad.nativeElement.height,
    };
  }

  signatureSave() {
    if (!this.context) return;
    const dataUrl = this.signaturePad.nativeElement.toDataURL();
  }

  signatureClear() {
    if (!this.context) return;
    this.context.clearRect(
      0,
      0,
      this.signaturePad.nativeElement.width,
      this.signaturePad.nativeElement.height
    );
  }
}
