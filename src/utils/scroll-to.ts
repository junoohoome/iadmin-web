// Easing function for smooth animation
function easeInOutQuad(t: number, b: number, c: number, d: number): number {
  t /= d / 2
  if (t < 1) {
    return c / 2 * t * t + b
  }
  t--
  return -c / 2 * (t * (t - 2) - 1) + b
}

// requestAnimationFrame for Smart Animating http://goo.gl/sx5sts
const requestAnimFrame = (function() {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback: FrameRequestCallback) {
      window.setTimeout(callback, 1000 / 60)
    }
  )
})()

/**
 * Because it's so fucking difficult to detect the scrolling element, just move them all
 * @param amount - The scroll position to set
 */
function move(amount: number): void {
  document.documentElement.scrollTop = amount
  document.body.parentNode!.scrollTop = amount
  document.body.scrollTop = amount
}

function position(): number {
  return (
    document.documentElement.scrollTop ||
    document.body.parentNode!.scrollTop ||
    document.body.scrollTop
  )
}

/**
 * Smooth scroll to a specific position
 * @param to - Target scroll position
 * @param duration - Animation duration in milliseconds (default: 500)
 * @param callback - Optional callback function when animation completes
 */
export function scrollTo(
  to: number,
  duration?: number,
  callback?: () => void
): void {
  const start = position()
  const change = to - start
  const increment = 20
  let currentTime = 0
  duration = typeof duration === 'undefined' ? 500 : duration

  const animateScroll = function() {
    // increment the time
    currentTime += increment
    // find the value with the quadratic in-out easing function
    const val = easeInOutQuad(currentTime, start, change, duration)
    // move the document.body
    move(val)
    // do the animation unless its over
    if (currentTime < duration) {
      requestAnimFrame(animateScroll)
    } else {
      if (callback && typeof callback === 'function') {
        // the animation is done so lets callback
        callback()
      }
    }
  }
  animateScroll()
}
