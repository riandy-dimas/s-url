import Redirect from '@/utils/Redirect';
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ shortId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Main({ params, searchParams }: PageProps) {
  const { shortId } = await params
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('urls')
    .select('id, long_url')
    .eq('short_id', shortId)

  if (data?.length === 0 || error) {
    return notFound()
  }

  const { id, long_url } = data[0]

  const getUtm = (utm: Awaited<PageProps['searchParams']>): Record<string, string> | undefined => {
    if (!utm) return undefined
    if (Array.isArray(utm)) return undefined
    return Object.entries(utm)
      .reduce((res, [key, value]) => {
        if (typeof value !== 'string') return res
        switch (key) {
          case 'utm_campaign':
          case 'utm_medium':
          case 'utm_source':
            return {...res, [key]: value}
          default:
            return res
        }
      }, {})
  }

  if (typeof resolvedSearchParams === 'object') {
    await supabase
      .from('accesseds')
      .insert({
        url_id: id,
        ...getUtm(resolvedSearchParams)
      })
  }

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content prose">
        <span className="loading loading-bars loading-md text-accent" />
        <h3 className='m-0'>Redirecting..</h3>
      </div>
      <Redirect url={long_url} delay={2000} />
    </div>
  );
}
