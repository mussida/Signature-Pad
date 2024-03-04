import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import SignaturePad, { Options, PointGroup } from './signature_pad';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

export interface NgSignaturePadOptions extends Options {
  canvasHeight: number;
  canvasWidth: number;
}
@Component({
  selector: 'app-orginal-signature-pad',
  standalone: true,
  imports: [],
  templateUrl: './orginal-signature-pad.component.html',
  styleUrl: './orginal-signature-pad.component.scss',
})
export class OrginalSignaturePadComponent
  implements AfterContentInit, OnDestroy, AfterViewInit
{
  @Input() public options: NgSignaturePadOptions;
  @Output() public drawStart: EventEmitter<MouseEvent | Touch>;
  @Output() public drawBeforeUpdate: EventEmitter<MouseEvent | Touch>;
  @Output() public drawAfterUpdate: EventEmitter<MouseEvent | Touch>;
  @Output() public drawEnd: EventEmitter<MouseEvent | Touch>;

  @ViewChild('canvasElement', { static: true })
  private canvasElement: ElementRef<HTMLCanvasElement>;

  private signaturePad: SignaturePad;
  private _strokeHistory: Array<PointGroup> = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private elementRef: ElementRef
  ) {
    this.options = this.options || ({} as NgSignaturePadOptions);
    this.drawStart = new EventEmitter<MouseEvent | Touch>();
    this.drawBeforeUpdate = new EventEmitter<MouseEvent | Touch>();
    this.drawAfterUpdate = new EventEmitter<MouseEvent | Touch>();
    this.drawEnd = new EventEmitter<MouseEvent | Touch>();
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      window.onresize = () => this.redrawCanvas();
    }
  }

  public ngAfterContentInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const ratio: number = Math.max(window.devicePixelRatio || 1, 1);
    const rect = this.canvasElement.nativeElement.getBoundingClientRect();
    this.canvasElement.nativeElement.width = rect.width * ratio;
    this.canvasElement.nativeElement.height = rect.height * ratio;
    this.canvasElement.nativeElement?.getContext('2d')?.scale(ratio, ratio);

    this.signaturePad = new SignaturePad(
      this.canvasElement.nativeElement,
      this.options
    );
    this.signaturePad.addEventListener('beginStroke', (event: Event) =>
      this.beginStroke((event as CustomEvent).detail)
    );
    this.signaturePad.addEventListener('beforeUpdateStroke', (event: Event) =>
      this.beforeUpdateStroke((event as CustomEvent).detail)
    );
    this.signaturePad.addEventListener('afterUpdateStroke', (event: Event) =>
      this.afterUpdateStroke((event as CustomEvent).detail)
    );
    this.signaturePad.addEventListener('endStroke', (event: Event) =>
      this.endStroke((event as CustomEvent).detail)
    );
  }

  public ngOnDestroy(): void {
    this.canvasElement.nativeElement.width = 0;
    this.canvasElement.nativeElement.height = 0;
  }

  /**
   * Redraw or Resize canvas, note this will clear data.
   */
  // public redrawCanvas(): void {
  //   const ratio: number = Math.max(window.devicePixelRatio || 2, 3);
  //   console.log('devicePixelRatio', window.devicePixelRatio);
  //   console.log('ratio', ratio);
  //   const rect = this.canvasElement.nativeElement.getBoundingClientRect();
  //   console.log('rect', rect);
  //   this.canvasElement.nativeElement.width = rect.width * ratio;
  //   this.canvasElement.nativeElement.height = rect.height * ratio;
  //   this.canvasElement.nativeElement?.getContext('2d')?.scale(ratio, ratio);
  //   this.signaturePad.clear(); // otherwise isEmpty() might return incorrect value
  // }
  public redrawCanvas(): void {
    const ratio: number = Math.max(window.devicePixelRatio || 1, 1);
    console.log('devicePixelRatio', window.devicePixelRatio);
    console.log('ratio', ratio);
    const rect = this.canvasElement.nativeElement.getBoundingClientRect();
    console.log('rect', rect);
    console.log('rect.width', rect.width);
    console.log('rect.height', rect.height);
    console.log(
      'canvaselement',
      this.canvasElement.nativeElement.width,
      this.canvasElement.nativeElement.height
    );

    this.canvasElement.nativeElement.width = rect.width * ratio;
    this.canvasElement.nativeElement.height = rect.height * ratio;

    this.canvasElement.nativeElement?.getContext('2d')?.scale(ratio, ratio);
    this.signaturePad.clear(); // otherwise isEmpty() might return incorrect value
  }

  /**
   * Returns signature image as an array of point groups
   */
  public toData(): PointGroup[] {
    if (this.signaturePad) {
      return this.signaturePad.toData();
    } else {
      return [];
    }
  }

  /**
   * Draws signature image from an array of point groups
   */
  public fromData(points: Array<PointGroup>): void {
    this.signaturePad.fromData(points);
  }

  public downloadPNG(): void {
    // Convert the signature to PNG
    const dataUrl = this.signaturePad.toDataURL('image/png');

    // Create a link element
    const link = document.createElement('a');

    // Set the href and download attributes of the link
    link.href = dataUrl;
    link.download = 'signature.png';

    // Append the link to the body
    document.body.appendChild(link);

    // Simulate a click on the link
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  }

  public changeLineWidth(value: number): void {
    const width = Number(value);
    this.signaturePad.minWidth = width;
  }

  public downloadSVG(): void {
    // Convert the signature to SVG
    const dataUrl = this.signaturePad.toDataURL('image/svg+xml');

    // Create a link element
    const link = document.createElement('a');

    // Set the href and download attributes of the link
    link.href = dataUrl;
    link.download = 'signature.svg';

    // Append the link to the body
    document.body.appendChild(link);

    // Simulate a click on the link
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  }

  /**
   * Returns signature image as data URL (see https://mdn.io/todataurl for the list of possible parameters)
   */
  public toDataURL(imageType?: string, quality?: number): string {
    return this.signaturePad.toDataURL(imageType, quality); // save image as data URL
  }

  /**
   * Draws signature image from data URL
   */
  public fromDataURL(
    dataURL: string,
    options: { ratio?: number; width?: number; height?: number } = {}
  ): void {
    // set default height and width on read data from URL
    if (!options.hasOwnProperty('height') && this.options.canvasHeight) {
      options.height = this.options.canvasHeight;
    }
    if (!options.hasOwnProperty('width') && this.options.canvasWidth) {
      options.width = this.options.canvasWidth;
    }
    this.signaturePad.fromDataURL(dataURL, options);
  }

  public undo(): void {
    // Remove the points of the last stroke from the canvas data
    if (this._strokeHistory.length > 0) {
      this._strokeHistory.pop();
      const data = this.toData();
      if (data.length > 0) {
        data.pop();
        this.signaturePad.clear();
        this.fromData(data);
      }
    }
  }
  /**
   * Clears the canvas
   */
  public clear(): void {
    this.signaturePad.clear();
  }

  /**
   * Returns true if canvas is empty, otherwise returns false
   */
  public isEmpty(): boolean {
    return this.signaturePad.isEmpty();
  }

  /**
   * Unbinds all event handlers
   */
  public off(): void {
    this.signaturePad.off();
  }

  /**
   * Rebinds all event handlers
   */
  public on(): void {
    this.signaturePad.on();
  }

  /**
   * set an option on the signaturePad - e.g. set('minWidth', 50);
   * @param option one of SignaturePad to set with value, properties of NgSignaturePadOptions
   * @param value the value of option
   */
  public set(option: string, value: any): void {
    switch (option) {
      case 'canvasHeight':
        this.canvasElement.nativeElement.height = value;
        break;
      case 'canvasWidth':
        this.canvasElement.nativeElement.width = value;
        break;
      default:
      // this.signaturePad[option] = value;
    }
  }

  /**
   * notify subscribers on signature begin
   */
  public beginStroke(event: MouseEvent | Touch): void {
    this.drawStart.emit(event);
  }

  public beforeUpdateStroke(event: MouseEvent | Touch): void {
    this.drawBeforeUpdate.emit(event);
  }

  public afterUpdateStroke(event: MouseEvent | Touch): void {
    this.drawAfterUpdate.emit(event);
  }

  /**
   * notify subscribers on signature end
   */
  public endStroke(event: MouseEvent | Touch): void {
    this.drawEnd.emit(event);
    // Save the points of the new stroke
    const data = this.toData();
    if (data.length > 0) {
      this._strokeHistory.push(data[data.length - 1]);
    }
  }

  public getSignaturePad(): SignaturePad {
    return this.signaturePad;
  }
}
