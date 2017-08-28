import {Directive, ElementRef, Renderer} from '@angular/core';

@Directive({
  selector: '[parentSize]',
})
export class ParentSizeDirective {
  constructor(public el: ElementRef, public renderer: Renderer) {
    console.log('####### parentSize directive');
    // el.nativeElement.style.backgroundColor = 'yellow';
  }

  ngOnInit() { 
    // Find parent with heigth > 0    
    const firstParentHeightNotZero = this.getFirstParentHeightNotZero(this.el.nativeElement);
    console.log('####### parentSize:',  firstParentHeightNotZero);

    //this.renderer.setElementStyle(this.el.nativeElement.children[0], 'backgroundColor', 'orange');
    this.renderer.setElementStyle(this.el.nativeElement.children[0], 'height', firstParentHeightNotZero + 'px');
  }

  getFirstParentHeightNotZero(element) {
    if (element && element.offsetHeight > 0) {
        return element.offsetHeight;
    }
    return this.getFirstParentHeightNotZero(element.parentElement);
  }
}