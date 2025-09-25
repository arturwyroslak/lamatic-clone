import { Card, CardContent } from '@lamatic/ui'

const testimonials = [
  {
    name: 'Blas Giffuni',
    role: 'Co-Founder, Nemo',
    content: 'We have full control over the product experience, and Lamatic gives us the tools to move like a startup while building like an enterprise.'
  },
  {
    name: 'Jeff Wallman',
    role: 'Director of Technology, 84000',
    content: 'Lamatic is a fantastic partner. They have their finger on the pulse of new developments, and with their no-code approach, we can build apps without technical risk.'
  },
  {
    name: 'Joe',
    role: 'CEO, Daily.ai',
    content: 'My first reaction was "this is too good to be true, it has to be a gimmick or vaporware"... you\'re definitely onto something!'
  },
  {
    name: 'Adriel Lubarsky',
    role: 'Founder/CEO, Beehive',
    content: 'Lamatic gave us back our focus. And that focus is what lets Beehive help enterprises put their resources where they matter most.'
  }
]

export function Testimonials() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Trusted by Industry Leaders
          </h2>
          <p className="mx-auto mt-4 max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            See what our customers are saying about Lamatic
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <blockquote className="text-lg italic mb-4">
                  "{testimonial.content}"
                </blockquote>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}