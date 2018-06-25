import { Component, HostListener, OnInit, Input } from '@angular/core';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'dnr-drag-resize',
  templateUrl: './drag-resize.component.html',
  styleUrls: ['./drag-resize.component.scss'],
})
export class DragResizeComponent implements OnInit {
  @Input() src: string;

  x: number;
  y: number;
  px: number;
  py: number;
  width: number;
  height: number;

  ix: number;
  iy: number;
  iWidth: number;
  iHeight: number;

  minArea: number;
  draggingCorner: boolean;
  draggingWindow: boolean;
  draggingImg: boolean;
  resizer: Function;

  get differentSize() {
    return this.width !== this.iWidth || this.height !== this.iHeight;
  }

  constructor() {
    this.x = 300;
    this.y = 300;
    this.ix = 0;
    this.iy = 0;
    this.px = 0;
    this.py = 0;
    this.width = 375;
    this.height = 150;
    this.iWidth = 375;
    this.iHeight = 150;
    this.draggingCorner = false;
    this.draggingWindow = false;
    this.draggingImg = false;
    this.minArea = 20000;
  }

  ngOnInit() {}

  area() {
    return this.width * this.height;
  }

  onWindowPress(event: MouseEvent) {
    if (this.draggingImg) {
      return;
    }
    this.draggingWindow = true;
    this.px = event.clientX;
    this.py = event.clientY;
  }

  onWindowDrag(event: MouseEvent) {
    if (!this.draggingWindow) {
      return;
    }
    const offsetX = event.clientX - this.px;
    const offsetY = event.clientY - this.py;

    this.x += offsetX;
    this.y += offsetY;
    this.px = event.clientX;
    this.py = event.clientY;
  }

  onImgPress(event: MouseEvent) {
    this.draggingWindow = false;
    this.draggingImg = true;

    this.px = event.clientX;
    this.py = event.clientY;
  }

  onImgDrag(event: MouseEvent) {
    if (!this.draggingImg) {
      return;
    }

    const offsetX = event.clientX - this.px;
    const offsetY = event.clientY - this.py;

    this.ix += offsetX;
    this.iy += offsetY;

    this.px = event.clientX;
    this.py = event.clientY;

    this.applyConstraints(offsetX, offsetY);
  }

  topLeftResize(offsetX: number, offsetY: number) {
    this.x += offsetX;
    this.y += offsetY;
    this.width -= offsetX;
    this.height -= offsetY;
  }

  topRightResize(offsetX: number, offsetY: number) {
    this.y += offsetY;
    this.width += offsetX;
    this.height -= offsetY;
  }

  bottomLeftResize(offsetX: number, offsetY: number) {
    this.x += offsetX;
    this.width -= offsetX;
    this.height += offsetY;
  }

  bottomRightResize(offsetX: number, offsetY: number) {
    this.width += offsetX;
    this.height += offsetY;
  }

  onCornerClick(event: MouseEvent, resizer?: Function) {
    this.draggingCorner = true;
    this.px = event.clientX;
    this.py = event.clientY;
    this.resizer = resizer;
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('document:mousemove', ['$event'])
  onCornerMove(event: MouseEvent) {
    if (!this.draggingCorner) {
      return;
    }
    const offsetX = event.clientX - this.px;
    const offsetY = event.clientY - this.py;

    const lastX = this.x;
    const lastY = this.y;
    const pWidth = this.width;
    const pHeight = this.height;

    this.resizer(offsetX, offsetY);
    if (this.area() < this.minArea) {
      this.x = lastX;
      this.y = lastY;
      this.width = pWidth;
      this.height = pHeight;
    }
    this.px = event.clientX;
    this.py = event.clientY;

    this.applyConstraints(offsetX, offsetY);
  }

  applyConstraints(offsetX: number, offsetY: number) {
    const left = this.x;
    const right = left + this.width;
    const top = this.y;
    const bottom = top + this.height;

    if (this.ix + this.iWidth < this.width) {
      this.ix = this.width - this.iWidth;
    }

    if (this.ix > 0) {
      this.ix = 0;
    }
    if (this.iy + this.iHeight < this.height) {
      this.iy = this.height - this.iHeight;
    }
    if (this.iy > 0) {
      this.iy = 0;
    }

    if (this.iHeight < this.height) {
      // landscape
      this.iHeight = this.height;
    }
    if (this.iWidth < this.width) {
      // portrait
      this.iWidth = this.width;
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onCornerRelease(event: MouseEvent) {
    this.draggingWindow = false;
    this.draggingCorner = false;
    this.draggingImg = false;
  }
}
